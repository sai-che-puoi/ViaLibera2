import os
import sys
import urllib3
import json
import pydeck as pdk  # make sure pydeck is installed

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from dotenv import load_dotenv
from streamlit_autorefresh import st_autorefresh

# Ensure project root is importable (since app.py is in dashboard/)
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from google_api import get_access_token, get_sheet_data
from config import SPREADSHEET_ID, SHEET_NAME

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load .env (used locally; on Streamlit Cloud you'll use st.secrets)
BASE_DIR = os.path.dirname(__file__)
dotenv_path = os.path.join(ROOT_DIR, ".env")  # adjust if needed
load_dotenv(dotenv_path=dotenv_path)

st.set_page_config(page_title="Google Sheet Dashboard", layout="wide")
st.title("Google Sheet Live Dashboard")


# -----------------------------
# Data loading
# -----------------------------
@st.cache_data(ttl=60)
def load_data_from_google_sheet():
    access_token = get_access_token()
    rows = get_sheet_data(access_token, SPREADSHEET_ID, SHEET_NAME)
    if not rows:
        return pd.DataFrame()

    headers = rows[0]
    data_rows = rows[1:]
    df = pd.DataFrame(data_rows, columns=headers)
    return df


df = load_data_from_google_sheet()

if df.empty:
    st.warning("No data found in the Google Sheet.")
    st.stop()

# Colums for Likert heatmap
likert_cols = [
    "Troppo spazio per auto",
    "Trasporto pubblico inefficiente",
    "Meno auto per cambiamento climatico",
    "Normale auto per strada",
    "Più verde",
    "Aggregazione porta disturbo",
    "Da parcheggi ad aggregazione",
]

required_cols = ["ID", "Lavoro", "Squadra", "Età", "Latitude", "Longitude", "Genere", "Limitare le auto migliora o peggiora"] + likert_cols
missing = [c for c in required_cols if c not in df.columns]
if missing:
    st.error(f"Missing required columns in sheet: {', '.join(missing)}")
    st.stop()

# Pre-processing
id_series = df["ID"].replace("", pd.NA)
unique_ids_count = id_series.dropna().nunique()

# Count values in "Lavoro" column (after dropping empty strings)
lavoro_series = df["Lavoro"].replace("", pd.NA)
lavoro_counts = lavoro_series.dropna().value_counts()

# Count top 10 values in "Squadra" column (if it exists)
squadra_series = df["Squadra"].replace("", pd.NA)
squadra_counts = squadra_series.dropna().value_counts().head(10)  # top 10 values

age_series = df["Età"].replace("", pd.NA).replace("NA", pd.NA).dropna().astype(float)

# Compile age buckets
age_buckets = {
    "<=25": age_series.between(0, 25, inclusive="both").sum(),
    "26-35": age_series.between(26, 35, inclusive="both").sum(),
    "36-45": age_series.between(36, 45, inclusive="both").sum(),
    "46-55": age_series.between(46, 55, inclusive="both").sum(),
    "56-65": age_series.between(56, 65, inclusive="both").sum(),
    "65-75": age_series.between(65, 75, inclusive="both").sum(),
    ">75": age_series.gt(75).sum(),
}

# Get gender distribution
gender_series = df["Genere"].replace("", pd.NA)
gender_counts = gender_series.dropna().value_counts()

# Get answers to question "Limitare le auto migliora o peggiora"
auto_migliora_peggiora = df["Limitare le auto migliora o peggiora"].dropna().value_counts().to_dict()

# Pre-processing for heatmap
if "Latitude" in df.columns and "Longitude" in df.columns:
    latlon_df = df[["Latitude", "Longitude"]].replace("", pd.NA).dropna()

    # Convert to float if needed (Google Sheets often returns strings)
    latlon_df["Latitude"] = latlon_df["Latitude"].astype(float)
    latlon_df["Longitude"] = latlon_df["Longitude"].astype(float)
else:
    latlon_df = pd.DataFrame()

@st.cache_data
def load_nil_geojson():
    geojson_path = os.path.join(ROOT_DIR, "data", "milano_nil.geojson")
    with open(geojson_path, "r", encoding="utf-8") as f:
        return json.load(f)
    
nil_geojson = load_nil_geojson()

# -----------------------------
# Chart render functions
# -----------------------------
def render_gauge():
    """Render gauge (dial) for unique non-null IDs."""
    gauge_fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=unique_ids_count,
            # title={"text": "Unique IDs"},
            number={"font": {"size": 75}},
            gauge={
                "axis": {"range": [0, 1000],
                         "tickfont":{"size": 20}},
                "bar": {"color": "darkblue"},
                "steps": [
                    {"range": [0, 250], "color": "#e0f3ff"},
                    {"range": [250, 500], "color": "#a6cee3"},
                    {"range": [500, 750], "color": "#1f78b4"},
                    {"range": [750, 1000], "color": "#08306b"},
                ],
            },
        )
    )
    st.plotly_chart(gauge_fig, width='stretch')

def render_squadra_barchart():
    """Column chart showing the most common values in 'Squadra'."""
    if squadra_counts.empty:
        st.info("No non-empty values found in 'Squadra' column.")
        return

    # Make labels bigger and show counts on top
    bar_fig = go.Figure(
        data=[
            go.Bar(
                x=squadra_counts.index,
                y=squadra_counts.values,
                marker_color="steelblue",
                text=squadra_counts.values,
                textposition="inside",
                textfont={"size": 20},
            )
        ]
    )

    bar_fig.update_layout(
        # title="Squadra - Most Common Values",
        xaxis_title="Squadra",
        yaxis_title="Interviste",
        margin=dict(t=40, b=20, l=20, r=20)
    )

    st.plotly_chart(bar_fig, width='stretch')

def render_heatmap():
    """Heatmap over Milan NIL polygons, using local GeoJSON (no external tiles)."""
    if latlon_df.empty:
        st.info("No valid Latitude/Longitude data available for heatmap.")
        return

    if not nil_geojson:
        st.info("NIL GeoJSON not loaded.")
        return

    # NIL polygons layer (background)
    nil_layer = pdk.Layer(
        "GeoJsonLayer",
        nil_geojson,
        opacity=0.4,
        stroked=True,
        filled=True,
        get_fill_color=[200, 200, 200, 80],   # light gray with alpha
        get_line_color=[80, 80, 80, 200],     # darker border
        line_width_min_pixels=2,
        pickable=True,
    )

    # Heatmap layer for your points
    heatmap_layer = pdk.Layer(
        "HeatmapLayer",
        data=latlon_df,
        get_position=["Longitude", "Latitude"],
        aggregation="MEAN",
        threshold=0.05,
        intensity=1.0,
        radiusPixels=30,
    )

    # Center on Milan (approximate center)
    view_state = pdk.ViewState(
        latitude=45.4642,
        longitude=9.19,
        zoom=10.5,    # tweak as you like (10–13)
        pitch=0,
        bearing=0,
    )

    deck = pdk.Deck(
        layers=[nil_layer, heatmap_layer],
        initial_view_state=view_state,
        map_style=None,  # 🚫 no external map tiles
        tooltip={"text": "NIL: {NIL}"},
    )

    st.pydeck_chart(deck)

def render_age_distribution():
    """Render bar chart for age distribution."""
    age_df = pd.DataFrame({
        "Age Group": list(age_buckets.keys()),
        "Count": list(age_buckets.values())
    })

    age_fig = go.Figure(
        data=[
            go.Bar(
                x=age_df["Age Group"],
                y=age_df["Count"],
                marker_color="mediumpurple"
            )
        ]
    )

    age_fig.update_layout(
        # title="Age Distribution",
        xaxis_title="Età",
        yaxis_title="Numero",
        margin=dict(t=20, b=20, l=20, r=20)
    )

    st.plotly_chart(age_fig, width='stretch')

def render_gender_distribution():
    """Render donut chart for gender distribution."""
    if gender_counts.empty:
        st.info("No non-empty values found in 'Genere' column.")
        return
    
    donut_fig = go.Figure(
        data=[
            go.Pie(
                labels=gender_counts.index,
                values=gender_counts.values,
                hole=0.5,
                textinfo="percent+label",
                textposition="outside",
                textfont={"size": 20}
            )
        ]
    )
    donut_fig.update_layout(
        showlegend=False,
        margin=dict(t=20, b=20, l=20, r=20),
    )
    st.plotly_chart(donut_fig, width='stretch')

def render_auto_migliora_peggiora():
    """Render bar chart for 'Limitare le auto migliora o peggiora' question."""
    if not auto_migliora_peggiora:
        st.info("No non-empty values found for 'Limitare le auto migliora o peggiora'.")
        return

    ampp_df = pd.DataFrame({
        "Response": list(auto_migliora_peggiora.keys()),
        "Count": list(auto_migliora_peggiora.values())
    })

    ampp_fig = go.Figure(
        data=[
            go.Bar(
                x=ampp_df["Response"],
                y=ampp_df["Count"],
                marker_color="coral"
            )
        ]
    )

    ampp_fig.update_layout(
        # title="Opinioni su limitare le auto",
        xaxis_title="Risposta",
        yaxis_title="Conteggio",
        margin=dict(t=20, b=20, l=20, r=20)
    )

    st.plotly_chart(ampp_fig, width='stretch')

def render_likert_heatmap():
    """Heatmap of score frequencies for the 7 affirmations (1-10)."""

    # Ensure they all exist
    missing_cols = [c for c in likert_cols if c not in df.columns]
    if missing_cols:
        st.error(f"Missing Likert columns: {', '.join(missing_cols)}")
        return

    # Convert to numeric
    df_likert = df[likert_cols].apply(pd.to_numeric, errors="coerce")

    # Long format: question, score
    long_df = df_likert.melt(
        var_name="Question",
        value_name="Score"
    ).dropna()

    # Filter to valid score range, just in case
    long_df = long_df[(long_df["Score"] >= 1) & (long_df["Score"] <= 10)]

    # Count frequencies
    freq = (
        long_df
        .groupby(["Question", "Score"])
        .size()
        .reset_index(name="Count")
    )

    # Pivot to matrix: rows = Question, cols = Score (1-10)
    matrix = freq.pivot(index="Question", columns="Score", values="Count").fillna(0)

    # Ensure all scores 1..10 are present as columns
    all_scores = list(range(1, 11))
    matrix = matrix.reindex(columns=all_scores, fill_value=0)

    # Build heatmap
    heatmap_fig = go.Figure(
        data=go.Heatmap(
            z=matrix.values,
            x=[str(s) for s in matrix.columns],
            y=matrix.index.tolist(),
            colorscale="Blues",
            colorbar=dict(title="Count"),
        )
    )

    heatmap_fig.update_layout(
        # title="Distribution of Scores per Statement",
        xaxis_title="Score (1–10)",
        yaxis_title="Statement",
        yaxis=dict(automargin=True),
        margin=dict(l=120, r=20, t=40, b=40),
    )

    st.plotly_chart(heatmap_fig, width='stretch')

def lavoro_donut():
    """Render donut chart for 'Lavoro' distribution."""
    if lavoro_counts.empty:
        st.info("No non-empty values found in 'Lavoro' column.")
        return

    donut_fig = go.Figure(
        data=[
            go.Pie(
                labels=lavoro_counts.index,
                values=lavoro_counts.values,
                hole=0.5,
                textinfo="percent+label",
                textposition="outside",
                textfont={"size": 20}
            )
        ]
    )
    donut_fig.update_layout(
        showlegend=False,
        margin=dict(t=20, b=20, l=20, r=20),
    )
    st.plotly_chart(donut_fig, width='stretch')


# List of charts in the carousel (you can add more later)

CHARTS = [
    ("Numero di interviste", render_gauge),
    ("Top 10 Squadre", render_squadra_barchart),
    ("Mappa densità", render_heatmap),
    ("Distribuzione età", render_age_distribution),
    ("Distribuzione genere", render_gender_distribution),
    ("Distribuzione occupazione", lavoro_donut),
    ("Opinioni su limitare le auto", render_auto_migliora_peggiora),
    ("Valutazioni affermazioni (1-10)", render_likert_heatmap),
]



# -----------------------------
# Carousel logic
# -----------------------------

# 1. Auto-refresh
REFRESH_INTERVAL_MS = 20_000  # 20 seconds
refresh_count = st_autorefresh(
    interval=REFRESH_INTERVAL_MS,
    limit=None,
    key="carousel_autorefresh",
)

# 2. Determine current chart index
if "chart_index" not in st.session_state:
    st.session_state.chart_index = 0

# Use refresh_count to advance chart index
st.session_state.chart_index = refresh_count % len(CHARTS)

current_title, current_renderer = CHARTS[st.session_state.chart_index]

# 3. Optional: show current slide indicator
st.markdown(
    f"**Slide {st.session_state.chart_index + 1} / {len(CHARTS)}** &nbsp; | &nbsp; _auto-rotating every {REFRESH_INTERVAL_MS // 1000}s_"
)

st.subheader(current_title)
current_renderer()

# # Optional manual navigation controls
# col_prev, col_next = st.columns(2)
# with col_prev:
#     if st.button("◀ Previous", width='stretch'):
#         st.session_state.chart_index = (st.session_state.chart_index - 1) % len(CHARTS)
#         st.rerun()
# with col_next:
#     if st.button("Next ▶", width='stretch'):
#         st.session_state.chart_index = (st.session_state.chart_index + 1) % len(CHARTS)
#         st.rerun()