import os
import requests
import streamlit as st

# ==========================
# CONFIG FROM STREAMLIT SECRETS
# ==========================

# These must be defined in Streamlit Secrets (Settings → Secrets):
# [google_oauth]
# client_id = "..."
# client_secret = "..."
# refresh_token = "..."

GOOGLE_CLIENT_ID = st.secrets["google_oauth"]["client_id"]
GOOGLE_CLIENT_SECRET = st.secrets["google_oauth"]["client_secret"]
REFRESH_TOKEN = st.secrets["google_oauth"]["refresh_token"]

# SSL verification flag (optional override from secrets)
VERIFY_SSL = True
google_oauth_secrets = st.secrets.get("google_oauth", {})
if "verify_ssl" in google_oauth_secrets:
    # Streamlit secrets values are strings/booleans depending on TOML;
    # we coerce to bool defensively.
    VERIFY_SSL = bool(google_oauth_secrets["verify_ssl"])


# ==========================
# AUTHENTICATION
# ==========================

def get_access_token() -> str:
    """
    Refresh the OAuth access token using the stored refresh token.

    Returns:
        str: A fresh OAuth access token.

    Raises:
        Exception: If the token refresh request fails.
    """
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
        "grant_type": "refresh_token",
    }

    response = requests.post(token_url, data=data, verify=VERIFY_SSL, timeout=10)

    if response.status_code != 200:
        raise Exception(
            f"Failed to refresh token: {response.status_code} - {response.text}"
        )

    resp_json = response.json()
    access_token = resp_json.get("access_token")

    if not access_token:
        raise Exception(
            f"Token endpoint did not return access_token. Response: {resp_json}"
        )

    return access_token


# ==========================
# GOOGLE SHEETS FUNCTIONS
# ==========================

def get_sheet_data(access_token: str, spreadsheet_id: str, sheet_name: str):
    """
    Read values from a Google Sheet.

    Args:
        access_token: OAuth access token string.
        spreadsheet_id: ID of the spreadsheet.
        sheet_name: Sheet range or name (e.g. 'Sheet1' or 'Sheet1!A1:D100').

    Returns:
        List of rows (list of lists), or [] if none.
    """
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{sheet_name}"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers, verify=VERIFY_SSL, timeout=10)

    if response.status_code != 200:
        raise Exception(
            f"Failed to fetch sheet data: {response.status_code} - {response.text}"
        )

    return response.json().get("values", [])


def update_sheet(
    access_token: str, spreadsheet_id: str, sheet_name: str, updated_values
):
    """
    Update values in a Google Sheet (RAW mode).

    Args:
        access_token: OAuth access token string.
        spreadsheet_id: ID of the spreadsheet.
        sheet_name: Sheet range or name (e.g. 'Sheet1' or 'Sheet1!A1:D100').
        updated_values: 2D list with the new values.

    Returns:
        The JSON response from the API.
    """
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/"
        f"{spreadsheet_id}/values/{sheet_name}?valueInputOption=RAW"
    )
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    body = {"values": updated_values}

    response = requests.put(
        url, headers=headers, json=body, verify=VERIFY_SSL, timeout=10
    )

    if response.status_code != 200:
        raise Exception(
            f"Failed to update sheet: {response.status_code} - {response.text}"
        )

    return response.json()


# ==========================
# GOOGLE DRIVE FUNCTIONS
# ==========================

def download_audio_file(access_token: str, file_id: str, file_name: str) -> str:
    """
    Download an audio file from Google Drive to a local 'downloads' directory.

    Args:
        access_token: OAuth access token string.
        file_id: Drive file ID.
        file_name: Local file name to save as.

    Returns:
        The local file path of the downloaded file.

    Raises:
        Exception: If the download fails.
    """
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
    headers = {"Authorization": f"Bearer {access_token}"}

    downloads_dir = "downloads"
    os.makedirs(downloads_dir, exist_ok=True)
    file_path = os.path.join(downloads_dir, file_name)

    with requests.get(url, headers=headers, stream=True, verify=VERIFY_SSL, timeout=30) as r:
        if r.status_code != 200:
            raise Exception(
                f"Failed to download file: {r.status_code} - {r.text}"
            )

        with open(file_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    return file_path