import os
import sys
import urllib3
import json
import pydeck as pdk
import string

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

# Toggle instead of radio
IS_MOBILE = st.toggle("Mobile layout", value=False)
# IS_MOBILE = False

# If needed, still store in session_state
st.session_state["layout_mode"] = "Mobile" if IS_MOBILE else "Desktop"

# Global sizing depending on layout mode
NUMBER_FONT_SIZE = 40 if IS_MOBILE else 75
AXIS_FONT_SIZE = 16 if IS_MOBILE else 25
TITLE_FONT_SIZE = 16 if IS_MOBILE else 25
PIE_LABEL_FONT_SIZE = 14 if IS_MOBILE else 25
CHART_HEIGHT = 400 if IS_MOBILE else 600
MAP_HEIGHT = 400 if IS_MOBILE else 750
SQUARE_CHART_SIZE = 350 if IS_MOBILE else 600
CARTESIAN_TEXT_SIZE = 10 if IS_MOBILE else 16
STANDARD_MARGIN = dict(t=10, b=10, l=10, r=10) if IS_MOBILE else dict(t=20, b=150, l=20, r=20)

PLOTLY_CONFIG_STATIC = {
    "staticPlot": True,         # this overrides zoom/pan/drag
}

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
            number={"font": {"size": NUMBER_FONT_SIZE}},
            gauge={
                "axis": {
                    "range": [0, 1000],
                    "tickfont": {"size": AXIS_FONT_SIZE},
                    "ticks": "outside"
                    },
                "bar": {"color": "lime"},
                "steps": [
                    {"range": [0, 250], "color": "#e0f3ff"},
                    {"range": [250, 500], "color": "#a6cee3"},
                    {"range": [500, 750], "color": "#1f78b4"},
                    {"range": [750, 1000], "color": "#08306b"},
                ],
            },
        )
    )
    st.plotly_chart(gauge_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

def render_squadra_barchart():
    """Horizontal bar chart showing the most common values in 'Squadra'."""
    if squadra_counts.empty:
        st.info("No non-empty values found in 'Squadra' column.")
        return

    # Sort by count ascending for better visualization
    sorted_counts = squadra_counts.sort_values(ascending=True)

    if IS_MOBILE:
        # Vertical bars on mobile
        sorted_counts = squadra_counts.sort_values(ascending=False)
        bar_trace = go.Bar(
            x=sorted_counts.index,
            y=sorted_counts.values,
            marker_color="steelblue",
            text=sorted_counts.values,
            textposition="inside",
            textfont={"size": 25},
        )
        xaxis_title = "Squadra"
        yaxis_title = "Interviste"
    else:
        # Horizontal bars on desktop (original)
        bar_trace = go.Bar(
            y=sorted_counts.index,
            x=sorted_counts.values,
            orientation="h",
            marker_color="steelblue",
            text=sorted_counts.values,
            textposition="inside",
            textfont={"size": AXIS_FONT_SIZE},
        )
        xaxis_title = "Interviste"
        yaxis_title = ""


    # Make labels bigger and show counts inside
    bar_fig = go.Figure(data=[bar_trace])

    bar_fig.update_layout(
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title,
        xaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        yaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        margin=STANDARD_MARGIN,
    )

    st.plotly_chart(bar_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

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
        zoom=11,    # tweak as you like (10–13)
        pitch=0,
        bearing=0,
    )

    deck = pdk.Deck(
        layers=[nil_layer, heatmap_layer],
        initial_view_state=view_state,
        map_style=None,  # 🚫 no external map tiles
        tooltip={"text": "NIL: {NIL}"},
    )

    st.pydeck_chart(deck, width='stretch', height=MAP_HEIGHT)

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
    grid_size = 500  # Increase for smoother result (300–500 recommended)
    grid_x, grid_y = np.mgrid[xmin:xmax:grid_size*1j, ymin:ymax:grid_size*1j]

    kde = gaussian_kde(np.vstack([x, y]))
    z = kde(np.vstack([grid_x.ravel(), grid_y.ravel()])).reshape(grid_x.shape)

    # 2) Plot as smooth heatmap
    fig = go.Figure(
        data=go.Heatmap(
            x=np.linspace(xmin, xmax, grid_size),
            y=np.linspace(ymin, ymax, grid_size),
            z=z.T,
            colorscale="viridis",
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

    # # Highlight axes
    # shapes.append(dict(
    #     type="line", x0=0, x1=0, y0=-100, y1=100,
    #     line=dict(color="black", width=1),
    # ))
    # shapes.append(dict(
    #     type="line", x0=-100, x1=100, y0=0, y1=0,
    #     line=dict(color="black", width=1)
    # ))

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

    # # 5) Add archetype markers (points only)
    # arche_x = [a["position"][0] for a in archetypes]
    # arche_y = [a["position"][1] for a in archetypes]
    # arche_labels = [a["label"] for a in archetypes]

    # # Create short codes: A, B, C, ...
    # letters = list(string.ascii_uppercase)
    # short_labels = [letters[i] for i in range(len(arche_labels))]

    # Build legend lines like "A. Ecociclista", "B. Pedone socievole", ...
    # legend_lines = [
    #     f"**{code}.** {label.replace("<br>", " ")}"
    #     for code, label in zip(short_labels, arche_labels)
    # ]

    # fig.add_trace(
    #     go.Scatter(
    #         x=arche_x,
    #         y=arche_y,
    #         mode="markers+text",
    #         name="Archetipi",
    #         marker=dict(
    #             size=8,
    #             color="gray",
    #             line=dict(width=1, color="black"),
    #         ),
    #         text=short_labels,          # A, B, C, ...
    #         textposition="top right",  # small labels, less overlap
    #         textfont=dict(size=CARTESIAN_TEXT_SIZE, color="black", weight="bold"),     # font size as requested
    #         hovertext=arche_labels,     # full label on hover
    #         hoverinfo="text",
    #     )
    # )

    fig.update_layout(
        shapes=shapes,
        annotations=annotations,
        xaxis=dict(
            # title="Coordinata X",
            range=[-100, 100],
            dtick=25,
            zeroline=True,
            zerolinecolor="black",
            zerolinewidth=1,
            scaleanchor="y",
            scaleratio=1,
            constrain="range",
        ),
        yaxis=dict(
            # title="Coordinata Y",
            range=[-100, 100],
            dtick=25,
            zeroline=True,
            zerolinecolor="black",
            zerolinewidth=1,
            scaleanchor="x",
            scaleratio=1,
            constrain="range",
        ),
        # Keep the figure square and not autosized
        autosize=True,
        width=SQUARE_CHART_SIZE,
        height=SQUARE_CHART_SIZE,
        # Larger margins to make space for outside labels
        margin=dict(t=60, b=60, l=120, r=120),
    )

    # 6) Center on the page using columns, but adapt layout for mobile (stack chart and legend vertically)
    if IS_MOBILE or not IS_MOBILE:
        # Stack: chart on top, legend below
        
        col_left, col_center, col_right = st.columns([1,1, 1])
        with col_center:
            st.plotly_chart(fig, width='content', config=PLOTLY_CONFIG_STATIC)

        # st.markdown("### Archetipi")
        # st.markdown("\n\n".join(legend_lines))
    # else:
        # # Original multi-column layout for desktop
        # col_left, col_center, col_right_1, col_right_2 = st.columns([0.5, 2, 1, 1])

        # with col_center:
        #     st.plotly_chart(fig, width='content', config=PLOTLY_CONFIG_STATIC)

        # with col_right_1:
        #     st.markdown("### Archetipi")
        #     st.markdown("\n\n".join(legend_lines[0:len(legend_lines)//2]))

        # with col_right_2:
        #     st.markdown("### ")
        #     st.markdown("\n\n".join(legend_lines[len(legend_lines)//2:]))

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
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        yaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        margin=STANDARD_MARGIN,
    )

    st.plotly_chart(age_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

def render_gender_distribution():
    """Render donut chart for gender distribution."""
    if gender_counts.empty:
        st.info("No non-empty values found in 'Genere' column.")
        return

    # Desktop vs Mobile settings
    if IS_MOBILE:
        pie_textinfo = "percent"          # only percent inside
        pie_textposition = "inside"
        show_legend = True                # separate legend
        legend_cfg = dict(
            orientation="h",              # horizontal legend below
            yanchor="top",
            y=-0.1,                       # slightly under the plot area
            xanchor="center",
            x=0.5,
            font=dict(size=AXIS_FONT_SIZE - 2),
        )
    else:
        pie_textinfo = "percent+label"    # labels + percent outside
        pie_textposition = "outside"
        show_legend = False               # no legend on desktop
        legend_cfg = dict()

    donut_fig = go.Figure(
        data=[
            go.Pie(
                labels=gender_counts.index,
                values=gender_counts.values,
                hole=0.5,
                textinfo=pie_textinfo,
                textposition=pie_textposition,
                textfont={"size": AXIS_FONT_SIZE},
            )
        ]
    )

    donut_fig.update_layout(
        showlegend=show_legend,
        legend=legend_cfg,
        margin=STANDARD_MARGIN,
        height=CHART_HEIGHT,
    )

    st.plotly_chart(donut_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

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

    if IS_MOBILE:
        # Vertical bars on mobile
        ampp_df = ampp_df.sort_values("Count", ascending=False)
        ampp_fig = go.Figure(
            data=[
                go.Bar(
                    x=ampp_df["Response"],
                    y=ampp_df["Count"],
                    marker_color="coral",
                    text=ampp_df["Count"],
                    textposition="outside",
                    textfont={"size": AXIS_FONT_SIZE},
                )
            ]
        )

        xaxis_title = "Risposta"
        yaxis_title = "Conteggio"
    else:        # Horizontal bars on desktop (original)

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
        xaxis_title = "Conteggio"
        yaxis_title = "Risposta"

    ampp_fig.update_layout(
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title,
        xaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        yaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        margin=STANDARD_MARGIN,
    )

    st.plotly_chart(ampp_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

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
    if IS_MOBILE:
        heatmap_fig = go.Figure(
            data=go.Heatmap(
                z=matrix.values,
                y=[str(s) for s in matrix.columns],
                x=matrix.index.tolist(),
                colorscale="Blues",
                colorbar=dict(
                    title=dict(
                        text="Conteggio",
                        font=dict(size=TITLE_FONT_SIZE)
                    ),
                    tickfont=dict(size=AXIS_FONT_SIZE)
                ),
            )
        )
        xaxis_title = ""
        yaxis_title = "Punteggio (1-10)"
    else:
        heatmap_fig = go.Figure(
            data=go.Heatmap(
                z=matrix.values,
                x=[str(s) for s in matrix.columns],
                y=matrix.index.tolist(),
                colorscale="Blues",
                colorbar=dict(
                    title=dict(
                        text="Conteggio",
                        font=dict(size=TITLE_FONT_SIZE)
                    ),
                    tickfont=dict(size=AXIS_FONT_SIZE)
                ),
            )
        )
        xaxis_title = "Punteggio (1-10)"
        yaxis_title = ""

    heatmap_fig.update_layout(
        # title="Distribution of Scores per Statement",
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title,
        xaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        yaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE),
            automargin=True
        ),
        margin=dict(l=120, r=20, t=40, b=40),
    )

    st.plotly_chart(heatmap_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

def lavoro_donut():
    """Render donut chart for 'Lavoro' distribution."""
    if lavoro_counts.empty:
        st.info("No non-empty values found in 'Lavoro' column.")
        return

    # Desktop vs Mobile settings
    if IS_MOBILE:
        pie_textinfo = "percent"          # only percent inside
        pie_textposition = "inside"
        show_legend = True                # separate legend
        legend_cfg = dict(
            orientation="h",              # horizontal legend
            yanchor="top",
            y=-0.1,                       # place below the chart
            xanchor="center",
            x=0.5,
            font=dict(size=AXIS_FONT_SIZE - 2),
        )
    else:
        pie_textinfo = "percent+label"    # labels + percent outside
        pie_textposition = "outside"
        show_legend = False
        legend_cfg = dict()               # no legend

    donut_fig = go.Figure(
        data=[
            go.Pie(
                labels=lavoro_counts.index,
                values=lavoro_counts.values,
                hole=0.5,
                textinfo=pie_textinfo,
                textposition=pie_textposition,
                textfont={"size": AXIS_FONT_SIZE},
            )
        ]
    )

    donut_fig.update_layout(
        showlegend=show_legend,
        legend=legend_cfg,
        margin=STANDARD_MARGIN,
        height=CHART_HEIGHT,
    )

    st.plotly_chart(donut_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)

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

    if IS_MOBILE:
        # Vertical bars on mobile
        transport_df = transport_df.sort_values("Count", ascending=False)
        transport_fig = go.Figure(
            data=[
                go.Bar(
                    x=transport_df["Mode"],
                    y=transport_df["Count"],
                    marker_color="teal",
                )
            ]
        )

        xaxis_title = "Modalità di trasporto"
        yaxis_title = "Conteggio"

    else:        # Horizontal bars on desktop (original)
        transport_fig = go.Figure(
            data=[
                go.Bar(
                    y=transport_df["Mode"],
                    x=transport_df["Count"],
                    orientation="h",
                    marker_color="teal",
                )
            ]
        )
        xaxis_title = "Conteggio"
        yaxis_title = "Modalità di trasporto"

    transport_fig.update_layout(
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title,
        xaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        yaxis=dict(
            tickfont=dict(size=AXIS_FONT_SIZE),
            title_font=dict(size=TITLE_FONT_SIZE)
        ),
        margin=STANDARD_MARGIN,
    )

    st.plotly_chart(transport_fig, width='stretch', height=CHART_HEIGHT, config=PLOTLY_CONFIG_STATIC)


# List of charts in the carousel (you can add more later)

ALL_CHARTS = [
    ("Numero di interviste", render_gauge),
    ("Top 5 Squadre", render_squadra_barchart),
    ("Mappa densità", render_heatmap),
    ("Distribuzione età", render_age_distribution),
    ("Modalità di trasporto", render_transport_modes_barchart),
    ("Distribuzione genere", render_gender_distribution),
    ("Distribuzione occupazione", lavoro_donut),
    ("Opinioni su limitare le auto", render_auto_migliora_peggiora),
    ("Valutazioni affermazioni (1-10)", render_likert_heatmap),
    ("Posizionamenti rilevati", render_cartesian_heatmap),
]

# Which charts to hide on mobile (you can match by function, safer than by title)
MOBILE_EXCLUDED_FUNCS = {
    render_auto_migliora_peggiora,
    render_likert_heatmap,
    render_cartesian_heatmap,
}

if IS_MOBILE:
    CHARTS = [
        (title, func)
        for (title, func) in ALL_CHARTS
        if func not in MOBILE_EXCLUDED_FUNCS
    ]
else:
    CHARTS = ALL_CHARTS

def render_slide_indicator():
    """Render a simple dot indicator for the current slide."""
    total = len(CHARTS)
    current = st.session_state.chart_index

    dots = []
    for i in range(total):
        # Filled dot for current, hollow for others
        dots.append("●" if i == current else "○")

    # Centered row of dots
    st.markdown(
        f"<div style='text-align:center; font-size: 1.4rem;'>{' '.join(dots)}</div>",
        unsafe_allow_html=True,
    )

# -----------------------------
# Carousel logic
# -----------------------------

REFRESH_INTERVAL_MS = 25_000 # Only for Desktop

if IS_MOBILE or not IS_MOBILE:
    # No auto-refresh on mobile
    refresh_count = 0
# else:
#     refresh_count = st_autorefresh(
#         interval=REFRESH_INTERVAL_MS,
#         limit=None,
#         key="carousel_autorefresh",
#     )


# Initialize state
if "chart_index" not in st.session_state:
    st.session_state.chart_index = 0

if "last_refresh_count" not in st.session_state:
    st.session_state.last_refresh_count = refresh_count


# 2. MOBILE: handle manual navigation FIRST
if IS_MOBILE or not IS_MOBILE:
    # Make buttons full-width within their columns
    st.markdown("""
    <style>
    div.stButton > button {
        width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

    # Use 3 columns to push arrows toward extremes
    col_left, col_spacer, col_right = st.columns([1, 4, 1], gap="xxsmall")

    with col_left:
        prev = st.button("◀", key="btn_prev")

    with col_right:
        next = st.button("▶", key="btn_next")

    if prev:
        st.session_state.chart_index = (st.session_state.chart_index - 1) % len(CHARTS)
    if next:
        st.session_state.chart_index = (st.session_state.chart_index + 1) % len(CHARTS)

# 3. DESKTOP: auto-advance (if you use st_autorefresh there)
# if not IS_MOBILE:
#     # your refresh_count / last_refresh_count logic here
#     if refresh_count != st.session_state.last_refresh_count:
#         st.session_state.last_refresh_count = refresh_count
#         st.session_state.chart_index = (st.session_state.chart_index + 1) % len(CHARTS)

# 4. NOW use the updated index
current_title, current_renderer = CHARTS[st.session_state.chart_index]

# Indicator line
render_slide_indicator()

st.subheader(current_title)
current_renderer()