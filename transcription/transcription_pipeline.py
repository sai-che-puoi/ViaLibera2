
import os
import io
import requests
import assemblyai as aai
from enhance_text import enhance_text
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import pickle

# ==========================
# CONFIGURATION PARAMETERS
# ==========================
SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"  # Google Sheet ID
SHEET_NAME = "Sheet1"                   # Name of the sheet
AUDIO_COLUMN_NAME = "audio"             # Column header for audio links
TRANSCRIPTION_COLUMN_NAME = "transcription"
ENHANCED_COLUMN_NAME = "enhanced transcription"

ASSEMBLYAI_API_KEY = "YOUR_ASSEMBLYAI_KEY"
# The following parameters are for OpenAI-compatible API, not necessarily OpenAI itself
OPENAI_API_URL = "YOUR_OPENAI_COMPATIBLE_ENDPOINT"
OPENAI_API_KEY = "YOUR_OPENAI_KEY"
OPENAI_MODEL = "gpt-3.5-turbo"                  # Model name for enhancement

# Google OAuth scopes
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
]

# ==========================
# AUTHENTICATION
# ==========================
def authenticate_google_services():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    sheets_service = build('sheets', 'v4', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)
    return sheets_service, drive_service

# ==========================
# GOOGLE SHEETS FUNCTIONS
# ==========================
def get_sheet_data(sheets_service):
    range_name = f"{SHEET_NAME}"
    result = sheets_service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID, range=range_name).execute()
    values = result.get('values', [])
    return values

def update_sheet(sheets_service, updated_values):
    range_name = f"{SHEET_NAME}"
    body = {'values': updated_values}
    sheets_service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID, range=range_name,
        valueInputOption="RAW", body=body).execute()

# ==========================
# GOOGLE DRIVE FUNCTIONS
# ==========================
def extract_file_id(drive_link):
    if "id=" in drive_link:
        return drive_link.split("id=")[-1]
    elif "/d/" in drive_link:
        return drive_link.split("/d/")[1].split("/")[0]
    else:
        raise ValueError("Invalid Google Drive link format")

def download_audio_file(drive_service, file_id, file_name):
    request = drive_service.files().get_media(fileId=file_id)
    file_path = os.path.join('downloads', file_name)
    os.makedirs('downloads', exist_ok=True)
    fh = io.FileIO(file_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.close()
    return file_path

# ==========================
# TRANSCRIPTION FUNCTION
# ==========================
def transcribe_audio(file_path):
    aai.settings.api_key = ASSEMBLYAI_API_KEY
    config = aai.TranscriptionConfig(language_code="it")
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(file_path, config=config)
    if transcript.status == aai.TranscriptStatus.error:
        return None
    return transcript.text

# ==========================
# ENHANCEMENT FUNCTION
# ==========================
def enhance_transcribed_text(input_text):
    return enhance_text(input_text, OPENAI_API_URL, OPENAI_API_KEY, OPENAI_MODEL)

# ==========================
# MAIN LOGIC
# ==========================
def main():
    sheets_service, drive_service = authenticate_google_services()
    rows = get_sheet_data(sheets_service)
    if not rows:
        print("No data found in the sheet.")
        return

    headers = rows[0]
    audio_col_index = headers.index(AUDIO_COLUMN_NAME)

    # Add new columns if not present
    if TRANSCRIPTION_COLUMN_NAME not in headers:
        headers.append(TRANSCRIPTION_COLUMN_NAME)
    if ENHANCED_COLUMN_NAME not in headers:
        headers.append(ENHANCED_COLUMN_NAME)

    updated_values = [headers]

    for row in rows[1:]:
        while len(row) < len(headers):
            row.append("")  # Ensure row length matches headers

        audio_link = row[audio_col_index]
        if audio_link:
            try:
                file_id = extract_file_id(audio_link)
                local_path = download_audio_file(drive_service, file_id, "temp_audio.mp3")
                transcription = transcribe_audio(local_path)
                enhanced = enhance_transcribed_text(transcription) if transcription else ""
                row[headers.index(TRANSCRIPTION_COLUMN_NAME)] = transcription
                row[headers.index(ENHANCED_COLUMN_NAME)] = enhanced
            except Exception as e:
                print(f"Error processing row: {e}")
        updated_values.append(row)

    update_sheet(sheets_service, updated_values)
    print("Sheet updated successfully!")

if __name__ == "__main__":
    main()
