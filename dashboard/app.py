import os
import sys
import urllib3
import json
import pydeck as pdk

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from streamlit_autorefresh import st_autorefresh
import numpy as np
from scipy.stats import gaussian_kde

# Ensure project root is importable (since app.py is in dashboard/)
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

# Import after sys.path fix
from google_api import get_access_token, get_sheet_data
from config import SPREADSHEET_ID, SHEET_NAME

# Optional: disable SSL warnings if verify_ssl=False in secrets
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Streamlit page config
st.set_page_config(page_title="Google Sheet Dashboard", layout="wide")
# st.title("Google Sheet Live Dashboard")


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

@st.cache_data
def load_archetypes():
    """Load archetype positions from local JSON file."""
    here = os.path.dirname(__file__)
    json_path = os.path.join(here, "archetype_positions.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

df = load_data_from_google_sheet()
archetypes = load_archetypes() 

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

transport_modes = [
    "Auto",
    "Bici",
    "Mezzi pubblici",
    "Piedi",
    "Moto/scooter",
    "Taxi",
    "Monopattino",
    "Altro"
]

required_cols = ["ID", "Lavoro", "Squadra", "Età", "Latitude", "Longitude", "Genere", "Limitare le auto migliora o peggiora", "Coordinata X", "Coordinata Y"] + likert_cols + transport_modes
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

# Count top 5 values in "Squadra" column (if it exists)
squadra_series = df["Squadra"].replace("", pd.NA)
squadra_counts = squadra_series.dropna().value_counts().head(5)  # top 5 values

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
# Remove empty keys if any (in case of empty strings)
auto_migliora_peggiora.pop("", None)

# Pre-processing for heatmap
if "Latitude" in df.columns and "Longitude" in df.columns:
    latlon_df = df[["Latitude", "Longitude"]].replace("", pd.NA).dropna()

    # Convert to float if needed (Google Sheets often returns strings)
    latlon_df["Latitude"] = latlon_df["Latitude"].astype(float)
    latlon_df["Longitude"] = latlon_df["Longitude"].astype(float)
else:
    latlon_df = pd.DataFrame()

# Pre-processing for transportation modes (sum aggregation)
transport_sums = {}
for mode in transport_modes:
    if mode in df.columns:
        # Convert to numeric, handle empty strings and NA values
        mode_series = df[mode].replace("", pd.NA).dropna()
        transport_sums[mode] = pd.to_numeric(mode_series, errors="coerce").sum()
    else:
        transport_sums[mode] = 0

# Get X and Y coordinate for cartesian heatmap (exclude rows with missing/invalid coordinates, valid coordinates are float in [-100, 100])
if "Coordinata X" in df.columns and "Coordinata Y" in df.columns:
    coord_df = df[["Coordinata X", "Coordinata Y"]].replace("", pd.NA).dropna()
    coord_df["Coordinata X"] = pd.to_numeric(coord_df["Coordinata X"], errors="coerce")
    coord_df["Coordinata Y"] = pd.to_numeric(coord_df["Coordinata Y"], errors="coerce")
    coord_df = coord_df[
        (coord_df["Coordinata X"].between(-100, 100)) &
        (coord_df["Coordinata Y"].between(-100, 100))
    ]

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
                         "tickfont":{"size": 25}},
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
    """Horizontal bar chart showing the most common values in 'Squadra'."""
    if squadra_counts.empty:
        st.info("No non-empty values found in 'Squadra' column.")
        return

    # Sort by count ascending for better visualization
    sorted_counts = squadra_counts.sort_values(ascending=True)

    # Make labels bigger and show counts inside
    bar_fig = go.Figure(
        data=[
            go.Bar(
                y=sorted_counts.index,
                x=sorted_counts.values,
                orientation="h",
                marker_color="steelblue",
                text=sorted_counts.values,
                textposition="inside",
                textfont={"size": 25},
            )
        ]
    )

    bar_fig.update_layout(
        xaxis_title="Interviste",
        xaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        yaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        margin=dict(t=40, b=20, l=20, r=20)
    )

    st.plotly_chart(bar_fig, width='stretch', height=600)

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
        latitude=45.45,
        longitude=9.19,
        zoom=10.8,    # tweak as you like (10–13)
        pitch=0,
        bearing=0,
    )

    deck = pdk.Deck(
        layers=[nil_layer, heatmap_layer],
        initial_view_state=view_state,
        map_style=None,  # 🚫 no external map tiles
        tooltip={"text": "NIL: {NIL}"},
    )

    st.pydeck_chart(deck, width='stretch', height=700)

def render_cartesian_heatmap():
    """Smooth Gaussian KDE heatmap on a [-100, 100] Cartesian plane with gridlines & axes."""
    if coord_df.empty:
        st.info("No valid coordinates available.")
        return

    # Extract coordinates
    x = coord_df["Coordinata X"].to_numpy()
    y = coord_df["Coordinata Y"].to_numpy()

    # Keep only points inside the plane
    mask = (x >= -100) & (x <= 100) & (y >= -100) & (y <= 100)
    x, y = x[mask], y[mask]

    if len(x) == 0:
        st.info("No data points within [-100,100] range.")
        return

    # 1) Build evaluation grid for KDE
    xmin, xmax = -100, 100
    ymin, ymax = -100, 100
    grid_size = 400  # Increase for smoother result (300–500 recommended)
    grid_x, grid_y = np.mgrid[xmin:xmax:grid_size*1j, ymin:ymax:grid_size*1j]

    kde = gaussian_kde(np.vstack([x, y]))
    z = kde(np.vstack([grid_x.ravel(), grid_y.ravel()])).reshape(grid_x.shape)

    # 2) Plot as smooth heatmap
    fig = go.Figure(
        data=go.Heatmap(
            x=np.linspace(xmin, xmax, grid_size),
            y=np.linspace(ymin, ymax, grid_size),
            z=z.T,
            colorscale="plasma",
            showscale=False,
            opacity=0.95,
        )
    )

    # 3) Add gridlines & axes
    shapes = []
    for v in range(-100, 101, 25):
        # vertical lines
        shapes.append(dict(
            type="line", x0=v, x1=v, y0=-100, y1=100,
            line=dict(color="rgba(150,150,150,0.5)", width=1)
        ))
        # horizontal lines
        shapes.append(dict(
            type="line", x0=-100, x1=100, y0=v, y1=v,
            line=dict(color="rgba(150,150,150,0.5)", width=1)
        ))

    # Highlight axes
    shapes.append(dict(
        type="line", x0=0, x1=0, y0=-100, y1=100,
        line=dict(color="black", width=3)
    ))
    shapes.append(dict(
        type="line", x0=-100, x1=100, y0=0, y1=0,
        line=dict(color="black", width=3)
    ))

    # 4) Semantic axis labels OUTSIDE the plot area (paper coordinates)
    annotations = [
        # X negative: left side, outside
        dict(
            x=-0.05, y=0.5,
            xref="paper", yref="paper",
            text="Quartiere<br>tranquillo",
            showarrow=False,
            xanchor="right",   # text ends at the plot area
            yanchor="middle",
            font=dict(size=20),
        ),
        # X positive: right side, outside
        dict(
            x=1.05, y=0.5,
            xref="paper", yref="paper",
            text="Quartiere<br>vivace",
            showarrow=False,
            xanchor="left",    # text starts at the plot area
            yanchor="middle",
            font=dict(size=20),
        ),
        # Y positive: top, outside
        dict(
            x=0.5, y=1.00,
            xref="paper", yref="paper",
            text="Cambiamo lo spazio pubblico",
            showarrow=False,
            xanchor="center",
            yanchor="bottom",
            font=dict(size=20),
        ),
        # Y negative: bottom, outside
        dict(
            x=0.5, y=-0.08,
            xref="paper", yref="paper",
            text="Teniamolo così",
            showarrow=False,
            xanchor="center",
            yanchor="top",
            font=dict(size=20),
        ),
    ]

    # 5) Add archetype markers (points only)
    arche_x = [a["position"][0] for a in archetypes]
    arche_y = [a["position"][1] for a in archetypes]
    arche_labels = [a["label"] for a in archetypes]


    fig.add_trace(
        go.Scatter(
            x=arche_x,
            y=arche_y,
            mode="markers",
            name="Archetipi",
            marker=dict(
                size=8,
                color="gray",
                line=dict(width=1, color="gray"),
            ),
            hovertext=arche_labels,
            hoverinfo="text",
        )
    )

    # 6) Add annotations for archetype labels
    for label, (ax, ay) in zip(arche_labels, zip(arche_x, arche_y)):
        # small data-space offsets to reduce overlap;
        # you can tweak these rules
        if ax >= 0 and ay >= 0:       # top-right quadrant
            dx, dy = 2, 2
            xanchor, yanchor = "left", "bottom"
        elif ax < 0 and ay >= 0:      # top-left quadrant
            dx, dy = -2, 2
            xanchor, yanchor = "right", "bottom"
        elif ax >= 0 and ay < 0:      # bottom-right
            dx, dy = 2, -2
            xanchor, yanchor = "left", "top"
        else:                         # bottom-left
            dx, dy = -2, -2
            xanchor, yanchor = "right", "top"

        annotations.append(
            dict(
                x=ax + dx,
                y=ay + dy,
                xref="x",
                yref="y",
                text=label,
                showarrow=False,
                xanchor=xanchor,
                yanchor=yanchor,
                font=dict(size=10),
            )
        )

    fig.update_layout(
        shapes=shapes,
        annotations=annotations,
        xaxis=dict(
            # title="Coordinata X",
            range=[-100, 100],
            dtick=25,
            zeroline=False,
            scaleanchor="y",
            scaleratio=1,
            constrain="range",
        ),
        yaxis=dict(
            # title="Coordinata Y",
            range=[-100, 100],
            dtick=25,
            zeroline=False,
            scaleanchor="x",
            scaleratio=1,
            constrain="range",
        ),
        # Keep the figure square and not autosized
        autosize=True,
        width=700,
        height=700,
        # Larger margins to make space for outside labels
        margin=dict(t=60, b=80, l=120, r=120),
    )

    # 6) Center on the page using columns
    col_left, col_center, col_right = st.columns([1, 1.75, 1])
    with col_center:
        st.plotly_chart(fig, use_container_width=False)

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
        xaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        yaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        margin=dict(t=20, b=20, l=20, r=20)
    )

    st.plotly_chart(age_fig, width='stretch', height=600)

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
                textfont={"size": 25}
            )
        ]
    )
    donut_fig.update_layout(
        showlegend=False,
        margin=dict(t=20, b=80, l=20, r=20),
    )
    st.plotly_chart(donut_fig, width='stretch', height=600)

def render_auto_migliora_peggiora():
    """Render bar chart for 'Limitare le auto migliora o peggiora' question."""
    if not auto_migliora_peggiora:
        st.info("No non-empty values found for 'Limitare le auto migliora o peggiora'.")
        return

    ampp_df = pd.DataFrame({
        "Response": list(auto_migliora_peggiora.keys()),
        "Count": list(auto_migliora_peggiora.values())
    })

    # Sort by count ascending for better visualization
    ampp_df = ampp_df.sort_values("Count", ascending=True)

    ampp_fig = go.Figure(
        data=[
            go.Bar(
                y=ampp_df["Response"],
                x=ampp_df["Count"],
                orientation="h",
                marker_color="coral"
            )
        ]
    )

    ampp_fig.update_layout(
        # title="Opinioni su limitare le auto",
        # yaxis_title="Risposta",
        xaxis_title="Conteggio",
        xaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        yaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        margin=dict(t=20, b=20, l=20, r=20)
    )

    st.plotly_chart(ampp_fig, width='stretch', height=600)

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
            colorbar=dict(
                title=dict(
                    text="Conteggio",
                    font=dict(size=25)
                ),
                tickfont=dict(size=25)
            ),
        )
    )

    heatmap_fig.update_layout(
        # title="Distribution of Scores per Statement",
        xaxis_title="Punteggio (1-10)",
        #yaxis_title="Statement",
        xaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        yaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25),
            automargin=True
        ),
        margin=dict(l=120, r=20, t=40, b=40),
    )

    st.plotly_chart(heatmap_fig, width='stretch', height=600)

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
                textfont={"size": 25}
            )
        ]
    )
    donut_fig.update_layout(
        showlegend=False,
        margin=dict(t=20, b=80, l=20, r=20),
    )
    st.plotly_chart(donut_fig, width='stretch', height=600)

def render_transport_modes_barchart():
    """Render bar chart for transportation modes aggregated by sum."""
    if not transport_sums or all(v == 0 for v in transport_sums.values()):
        st.info("No data found for transportation modes.")
        return

    transport_df = pd.DataFrame({
        "Mode": list(transport_sums.keys()),
        "Count": list(transport_sums.values())
    })

    # Sort by count descending for better visualization
    transport_df = transport_df.sort_values("Count", ascending=True)

    transport_fig = go.Figure(
        data=[
            go.Bar(
                y=transport_df["Mode"],
                x=transport_df["Count"],
                orientation="h",
                marker_color="teal",
                #text=transport_df["Count"],
                # textposition="inside",
                # textfont={"size": 20}
            )
        ]
    )

    transport_fig.update_layout(
        xaxis_title="Conteggio",
        xaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        yaxis=dict(
            tickfont=dict(size=25),
            title_font=dict(size=25)
        ),
        margin=dict(t=20, b=20, l=20, r=20)
    )

    st.plotly_chart(transport_fig, width='stretch', height=600)


# List of charts in the carousel (you can add more later)

CHARTS = [
    ("Posizionamenti rilevati", render_cartesian_heatmap),
    ("Numero di interviste", render_gauge),
    ("Top 5 Squadre", render_squadra_barchart),
    ("Mappa densità", render_heatmap),
    ("Distribuzione età", render_age_distribution),
    ("Modalità di trasporto", render_transport_modes_barchart),
    ("Distribuzione genere", render_gender_distribution),
    ("Distribuzione occupazione", lavoro_donut),
    ("Opinioni su limitare le auto", render_auto_migliora_peggiora),
    ("Valutazioni affermazioni (1-10)", render_likert_heatmap),
    #("Posizionamenti rilevati", render_cartesian_heatmap),
]



# -----------------------------
# Carousel logic
# -----------------------------

# 1. Auto-refresh
REFRESH_INTERVAL_MS = 15_000  # 15 seconds
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
# st.markdown(
#     f"**Slide {st.session_state.chart_index + 1} / {len(CHARTS)}** &nbsp; | &nbsp; _auto-rotating every {REFRESH_INTERVAL_MS // 1000}s_"
# )

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