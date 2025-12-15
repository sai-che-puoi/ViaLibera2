import os
import json
import pickle
import requests
import subprocess  # Added for running OAuth flow
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Paths
GOOGLE_CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS', 'credentials.json')
TOKEN_PICKLE_FILE = 'token.pickle'

# Read client_id and client_secret from credentials.json
with open(GOOGLE_CREDENTIALS_FILE, 'r') as f:
    creds_data = json.load(f)['installed']
    GOOGLE_CLIENT_ID = creds_data['client_id']
    GOOGLE_CLIENT_SECRET = creds_data['client_secret']

# Try to get refresh token from token.pickle or .env
refresh_token = None
if os.path.exists(TOKEN_PICKLE_FILE):
    with open(TOKEN_PICKLE_FILE, 'rb') as token_file:
        creds = pickle.load(token_file)
        refresh_token = getattr(creds, 'refresh_token', None)

if not refresh_token:
    refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')

if not refresh_token:
    # Launch OAuth flow if no token found
    print("No refresh token found. Running OAuth flow...")
    try:
        subprocess.run(["python", "oauth_flow.py"], cwd=os.path.dirname(__file__), check=True)
        # Reload token after OAuth
        if os.path.exists(TOKEN_PICKLE_FILE):
            with open(TOKEN_PICKLE_FILE, 'rb') as token_file:
                creds = pickle.load(token_file)
                refresh_token = getattr(creds, 'refresh_token', None)
        if not refresh_token:
            raise EnvironmentError("OAuth flow completed, but no refresh token found.")
    except subprocess.CalledProcessError as e:
        raise EnvironmentError(f"OAuth flow failed: {e}")

# Disable SSL verification globally for requests
VERIFY_SSL = False

# ==========================
# AUTHENTICATION
# ==========================
def get_access_token():
    """
    Refresh the OAuth access token using the refresh token.
    """
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(token_url, data=data, verify=VERIFY_SSL)
    if response.status_code != 200:
        raise Exception(f"Failed to refresh token: {response.status_code} - {response.text}")
    return response.json()["access_token"]

# ==========================
# GOOGLE SHEETS FUNCTIONS
# ==========================
def get_sheet_data(access_token, spreadsheet_id, sheet_name):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{sheet_name}"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers, verify=VERIFY_SSL)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch sheet data: {response.status_code} - {response.text}")
    return response.json().get("values", [])

def update_sheet(access_token, spreadsheet_id, sheet_name, updated_values):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{sheet_name}?valueInputOption=RAW"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    body = {"values": updated_values}
    response = requests.put(url, headers=headers, json=body, verify=VERIFY_SSL)
    if response.status_code != 200:
        raise Exception(f"Failed to update sheet: {response.status_code} - {response.text}")
    return response.json()

# ==========================
# GOOGLE DRIVE FUNCTIONS
# ==========================
def download_audio_file(access_token, file_id, file_name):
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
    headers = {"Authorization": f"Bearer {access_token}"}
    os.makedirs("downloads", exist_ok=True)
    file_path = os.path.join("downloads", file_name)

    with requests.get(url, headers=headers, stream=True, verify=VERIFY_SSL) as r:
        if r.status_code != 200:
            raise Exception(f"Failed to download file: {r.status_code} - {r.text}")
        with open(file_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return file_path