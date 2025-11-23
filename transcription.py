import sys
import os
import io

# Activate virtual environment if it exists
venv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv')
if os.path.exists(venv_path):
    activate_script = os.path.join(venv_path, 'bin', 'activate_this.py')
    # For modern Python versions, manually add venv to path
    site_packages = os.path.join(venv_path, 'lib', f'python{sys.version_info.major}.{sys.version_info.minor}',
                                 'site-packages')
    if os.path.exists(site_packages):
        sys.path.insert(0, site_packages)

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import assemblyai as aai
import pickle

# If modifying these scopes, delete the file token.pickle
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

ASSEMBLYAI_API_KEY = "XXX"  


def authenticate_google_drive():
    """Authenticate and return Google Drive service."""
    creds = None

    # The file token.pickle stores the user's access and refresh tokens
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('drive', 'v3', credentials=creds)
    return service


def get_folder_id_from_url(folder_url):
    """Extract folder ID from Google Drive URL."""
    # Handle different URL formats
    if '/folders/' in folder_url:
        folder_id = folder_url.split('/folders/')[-1].split('?')[0]
    else:
        folder_id = folder_url
    return folder_id


def list_audio_files(service, folder_id):
    """List all audio files in a Google Drive folder."""
    audio_extensions = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'wma']
    query = f"'{folder_id}' in parents and trashed=false"

    results = service.files().list(
        q=query,
        pageSize=100,
        fields="nextPageToken, files(id, name, mimeType)"
    ).execute()

    files = results.get('files', [])

    # Filter for audio files
    audio_files = []
    for file in files:
        ext = file['name'].split('.')[-1].lower()
        if ext in audio_extensions or 'audio' in file.get('mimeType', ''):
            audio_files.append(file)

    return audio_files


def download_file(service, file_id, file_name):
    """Download a file from Google Drive."""
    request = service.files().get_media(fileId=file_id)

    file_path = os.path.join('downloads', file_name)
    os.makedirs('downloads', exist_ok=True)

    fh = io.FileIO(file_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    print(f"Downloading {file_name}...")
    while done is False:
        status, done = downloader.next_chunk()
        if status:
            print(f"  Download {int(status.progress() * 100)}%")

    fh.close()
    print(f"Download completed: {file_path}")
    return file_path


def transcribe_audio(audio_file, api_key):
    """Transcribe audio file using AssemblyAI."""
    try:
        aai.settings.api_key = api_key

        # Configure transcription with Italian language
        config = aai.TranscriptionConfig(language_code="it")
        transcriber = aai.Transcriber()

        print(f"Uploading and transcribing {audio_file} (Italian)...")
        transcript = transcriber.transcribe(audio_file, config=config)

        if transcript.status == aai.TranscriptStatus.error:
            print(f"Transcription error: {transcript.error}")
            return None

        return transcript.text
    except Exception as e:
        print(f"Transcription error: {e}")
        return None


def main():
    if len(sys.argv) != 2:
        print(f"Syntax: {sys.argv[0]} GOOGLE_DRIVE_FOLDER_URL")
        print("\nExample:")
        print(f"  {sys.argv[0]} https://drive.google.com/drive/folders/1abc...")
        print(f"  {sys.argv[0]} 1abc...  (just the folder ID)")
        sys.exit(1)

    folder_url = sys.argv[1]

    # Step 1: Authenticate with Google Drive
    print("Step 1: Authenticating with Google Drive...")
    try:
        service = authenticate_google_drive()
    except Exception as e:
        print(f"Authentication error: {e}")
        print("\nMake sure you have 'credentials.json' in the same directory.")
        print("Get it from: https://console.cloud.google.com/")
        sys.exit(1)

    # Step 2: Get folder ID and list audio files
    print("\nStep 2: Listing audio files in folder...")
    folder_id = get_folder_id_from_url(folder_url)
    audio_files = list_audio_files(service, folder_id)

    if not audio_files:
        print("No audio files found in the folder.")
        sys.exit(1)

    print(f"Found {len(audio_files)} audio file(s):")
    for i, file in enumerate(audio_files, 1):
        print(f"  {i}. {file['name']}")

    # Step 3: Download and transcribe each file
    print(f"\nStep 3: Processing {len(audio_files)} file(s)...")

    os.makedirs('transcriptions', exist_ok=True)

    for i, file in enumerate(audio_files, 1):
        print(f"\n{'=' * 60}")
        print(f"Processing file {i}/{len(audio_files)}: {file['name']}")
        print(f"{'=' * 60}")

        # Download file
        try:
            local_path = download_file(service, file['id'], file['name'])
        except Exception as e:
            print(f"Failed to download {file['name']}: {e}")
            continue

        # Transcribe file
        transcription = transcribe_audio(local_path, ASSEMBLYAI_API_KEY)

        if transcription:
            # Save transcription
            base_name = os.path.splitext(file['name'])[0]
            output_file = os.path.join('transcriptions', f"{base_name}_transcription.txt")

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(transcription)

            print(f"\n✓ Transcription saved as: {output_file}")
            print(f"\nTranscription preview (first 300 chars):")
            print("-" * 50)
            print(transcription[:300] + ("..." if len(transcription) > 300 else ""))
        else:
            print(f"Failed to transcribe {file['name']}")

    print(f"\n{'=' * 60}")
    print("All files processed!")
    print(f"Audio files: ./downloads/")
    print(f"Transcriptions: ./transcriptions/")


if __name__ == "__main__":
    main()
