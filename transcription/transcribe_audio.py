
# This script calls AssemblyAI's API to transcribe an audio file in Italian.
# SSL verification is disabled (verify=False) for environments with self-signed certificates.

import requests
import time

def transcribe_audio(file_path, api_url, api_key, language_code="it", language_codes=["it", "en", "es", "fr", "ar", "si", "sw", "bn"]):
    """
    Transcribe an audio file using AssemblyAI API.

    Parameters:
    - file_path (str): Path to the local audio file.
    - api_url (str): The base URL of the AssemblyAI API (e.g., https://api.assemblyai.com/v2).
    - api_key (str): The API key for authentication.
    - language_code (str): Language code for transcription (default: "it" for Italian).
    - language_codes (list): List of language codes for transcription (default: ["it", "en", "es", "fr", "ar", "si", "sw", "bn"]).

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
        #"language_code": language_code,
        "language_detection": True,
        "language_detection_options": {
            "expected_languages": language_codes,
            "fallback_language": language_code
        }
    }

    transcript_response = requests.post(transcript_url, headers=headers, json=payload, verify=False)
    if transcript_response.status_code != 200:
        raise Exception(f"Transcription request failed: {transcript_response.status_code} - {transcript_response.text}")

    transcript_id = transcript_response.json().get("id")

    # Step 3: Poll for completion with timeout
    status_url = f"{api_url}/transcript/{transcript_id}"
    max_polls = 180  # e.g., 3 minutes at 1-second intervals
    poll_count = 0
    while poll_count < max_polls:
        status_response = requests.get(status_url, headers=headers, verify=False)
        if status_response.status_code != 200:
            raise Exception(f"Status check failed: {status_response.status_code} - {status_response.text}")

        status_data = status_response.json()
        if status_data["status"] == "completed":
            return status_data["text"]
        elif status_data["status"] == "failed":
            raise Exception(f"Transcription failed: {status_data}")
        # If still processing/queued, wait and retry
        time.sleep(1)  # Wait 1 second before next poll
        poll_count += 1
        if poll_count % 30 == 0:
            print(f"      Waiting for transcription... {poll_count} seconds elapsed")

    raise Exception("Transcription timed out after 3 minutes")
