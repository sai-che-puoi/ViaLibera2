
# This script calls AssemblyAI's API to transcribe an audio file in Italian.
# SSL verification is disabled (verify=False) for environments with self-signed certificates.

import requests

def transcribe_audio(file_path, api_url, api_key, language_code="it"):
    """
    Transcribe an audio file using AssemblyAI API.

    Parameters:
    - file_path (str): Path to the local audio file.
    - api_url (str): The base URL of the AssemblyAI API (e.g., https://api.assemblyai.com/v2).
    - api_key (str): The API key for authentication.
    - language_code (str): Language code for transcription (default: "it" for Italian).

    Returns:
    - str: The transcribed text.
    """

    headers = {
        "authorization": api_key
    }

    # Step 1: Upload the audio file
    upload_url = f"{api_url}/upload"
    with open(file_path, "rb") as f:
        upload_response = requests.post(upload_url, headers=headers, data=f, verify=False)

    if upload_response.status_code != 200:
        raise Exception(f"Upload failed: {upload_response.status_code} - {upload_response.text}")

    audio_url = upload_response.json().get("upload_url")

    # Step 2: Request transcription
    transcript_url = f"{api_url}/transcript"
    payload = {
        "audio_url": audio_url,
        "language_code": language_code
    }

    transcript_response = requests.post(transcript_url, headers=headers, json=payload, verify=False)
    if transcript_response.status_code != 200:
        raise Exception(f"Transcription request failed: {transcript_response.status_code} - {transcript_response.text}")

    transcript_id = transcript_response.json().get("id")

    # Step 3: Poll for completion
    status_url = f"{api_url}/transcript/{transcript_id}"
    while True:
        status_response = requests.get(status_url, headers=headers, verify=False)
        if status_response.status_code != 200:
            raise Exception(f"Status check failed: {status_response.status_code} - {status_response.text}")

        status_data = status_response.json()
        if status_data["status"] == "completed":
            return status_data["text"]
        elif status_data["status"] == "failed":
            raise Exception(f"Transcription failed: {status_data}")
