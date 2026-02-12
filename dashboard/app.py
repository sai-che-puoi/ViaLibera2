import os
import urllib3

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from dotenv import load_dotenv

from google_api import get_access_token, get_sheet_data
from config import SPREADSHEET_ID, SHEET_NAME

# -------------------------------------------------
# 0. Disable SSL warnings if you're already doing that
# -------------------------------------------------
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# -------------------------------------------------
# 1. Load environment variables (.env)
# -------------------------------------------------
# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# -------------------------------------------------
# 2. Streamlit page config
# -------------------------------------------------
st.set_page_config(page_title="Google Sheet Dashboard", layout="wide")
st.title("Google Sheet Live Dashboard")


# -------------------------------------------------
# 3. Data loading using your existing Google API helpers
# -------------------------------------------------
@st.cache_data(ttl=60)
def load_data_from_google_sheet():
    """
    Uses your existing google_api.get_access_token and get_sheet_data
    to pull data from the Google Sheet and convert it to a pandas DataFrame.
    Assumes:
      - First row is the header
      - Column names include "ID" and "Lavoro"
    """
    # Authenticate and get Google access token
    access_token = get_access_token()

    # Fetch data from Google Sheet
    rows = get_sheet_data(access_token, SPREADSHEET_ID, SHEET_NAME)
    if not rows:
        return pd.DataFrame()

    headers = rows[0]
    data_rows = rows[1:]

    # Create DataFrame
    df = pd.DataFrame(data_rows, columns=headers)

    return df


df = load_data_from_google_sheet()

if df.empty:
    st.warning("No data found in the Google Sheet.")
    st.stop()

# -------------------------------------------------
# 4. Pre-processing for charts
# -------------------------------------------------

# Ensure the expected columns exist
required_cols = ["ID", "Lavoro"]
missing = [c for c in required_cols if c not in df.columns]
if missing:
    st.error(f"Missing required columns in sheet: {', '.join(missing)}")
    st.stop()

# --- Unique non-null IDs (for gauge) ---
# Treat empty strings as null as well
id_series = df["ID"].replace("", pd.NA)
unique_ids_count = id_series.dropna().nunique()

# --- Lavoro distribution for donut ---
lavoro_series = df["Lavoro"].replace("", pd.NA)
lavoro_counts = lavoro_series.dropna().value_counts()

# -------------------------------------------------
# 5. Layout and charts
# -------------------------------------------------
col1, col2 = st.columns(2)

# 5a. Gauge / Dial Chart
with col1:
    st.subheader("Unique IDs (Gauge)")

    gauge_fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=unique_ids_count,
            title={"text": "Unique IDs"},
            gauge={
                "axis": {"range": [0, 1000]},  # lower bound 0, upper bound 1000
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

    st.plotly_chart(gauge_fig, use_container_width=True)

# 5b. Donut Chart for "Lavoro"
with col2:
    st.subheader("Lavoro Distribution (Donut)")

    if not lavoro_counts.empty:
        donut_fig = go.Figure(
            data=[
                go.Pie(
                    labels=lavoro_counts.index,
                    values=lavoro_counts.values,
                    hole=0.5,  # donut
                    textinfo="percent+label",
                )
            ]
        )
        donut_fig.update_layout(
            showlegend=True,
            margin=dict(t=20, b=20, l=20, r=20),
        )
        st.plotly_chart(donut_fig, use_container_width=True)
    else:
        st.info("No non-empty values found in 'Lavoro' column.")