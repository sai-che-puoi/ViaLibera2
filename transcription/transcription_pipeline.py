import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import os
from dotenv import load_dotenv
from enhance_text import enhance_text
from transcribe_audio import transcribe_audio
from google_api import get_access_token, get_sheet_data, update_sheet, download_audio_file
from config import (
    SPREADSHEET_ID, SHEET_NAME, AUDIO_COLUMN_NAME, AUDIO_EXTENSION,
    TRANSCRIPTION_COLUMN_NAME, ENHANCED_COLUMN_NAME,
    ASSEMBLYAI_API_URL, OPENAI_API_URL, OPENAI_MODEL
)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def main():
    # Authenticate and get Google access token
    access_token = get_access_token()
    print("Authenticated to Google Services")

    # Fetch data from Google Sheet
    rows = get_sheet_data(access_token, SPREADSHEET_ID, SHEET_NAME)
    print("Fetched data from Google Sheet")
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

    print("Start processing rows...")
    for i, row in enumerate(rows[1:], start=1):
        
        id_index = headers.index("ID")  # Find the index of the "ID" column
        id_value = row[id_index]        # Get the value from that column in the current row

        print(f"   Processing row {i+1} with id {id_value}")
        while len(row) < len(headers):
            row.append("")  # Ensure row length matches headers

        audio_link = row[audio_col_index]
        transcription = ""
        enhanced = ""

        
        if not audio_link:
            print("      No audio link found, skipping row...")
            updated_values.append(row)
            continue

        else:
            try:
                # Extract file ID from Google Drive link
                if "id=" in audio_link:
                    file_id = audio_link.split("id=")[-1]
                elif "/d/" in audio_link:
                    file_id = audio_link.split("/d/")[1].split("/")[0]
                else:
                    raise ValueError("Invalid Google Drive link format")
                
                # Check if row is already fully processed
                if row[headers.index(TRANSCRIPTION_COLUMN_NAME)] and row[headers.index(ENHANCED_COLUMN_NAME)]:
                    print("      Row already fully processed, skipping...")
                    updated_values.append(row)
                    continue

                # Check if transcription is already present
                if row[headers.index(TRANSCRIPTION_COLUMN_NAME)]:
                    print("      Transcription already present")
                    transcription = row[headers.index(TRANSCRIPTION_COLUMN_NAME)]
                else: # Download audio file and transcribe audio using AssemblyAI
                    print("      Downloading audio file...")
                    local_path = download_audio_file(access_token, file_id, f"temp_audio.{AUDIO_EXTENSION}")
                    print("      Transcribing audio...")
                    transcription = transcribe_audio(local_path, ASSEMBLYAI_API_URL, ASSEMBLYAI_API_KEY)

                # Check if enhanced transcription is already present
                if row[headers.index(ENHANCED_COLUMN_NAME)]:
                    print("      Enhanced transcription already present")
                    enhanced = row[headers.index(ENHANCED_COLUMN_NAME)]
                else: # Enhance transcription using OpenAI
                    if transcription:
                        print("      Enhancing transcription...")
                        enhanced = enhance_text(transcription, OPENAI_API_URL, OPENAI_API_KEY, OPENAI_MODEL)
                    else:
                        print("      Skipping enhancement (no transcription)")

            except Exception as e:
                print(f"      Error processing row: {e}")

        # Update row with transcription and enhanced text
        row[headers.index(TRANSCRIPTION_COLUMN_NAME)] = transcription
        row[headers.index(ENHANCED_COLUMN_NAME)] = enhanced
        updated_values.append(row)

    print("Updating sheet data...")
    update_sheet(access_token, SPREADSHEET_ID, SHEET_NAME, updated_values)
    print("Sheet updated successfully!")

if __name__ == "__main__":
    main()
