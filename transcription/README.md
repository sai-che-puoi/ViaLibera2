## Transcription Pipeline

This folder contains the transcription pipeline for processing audio files, transcribing them, and enhancing the text using an OpenAI-compatible API. It integrates with Google Sheets and Google Drive to fetch audio links and update results.

## Pipeline Overview

Flow: Google Sheet → Google Drive → Download Audio → Transcribe (AssemblyAI) → Enhance (OpenAI) → Update Google Sheet

## Folder Structure

Main Script: `transcription_pipeline.py` → Orchestrates the entire workflow.

### Helper Scripts:

`google_api.py` → Handles Google Sheets and Drive integration.

`transcribe_audio.py` → Transcribes audio via AssemblyAI.

`enhance_text.py` → Enhances Italian text using OpenAI-compatible API.

### Configuration:

`config.py` → Set API URLs, model names, spreadsheet details, and column names.

`.env` → Store API keys and Google credentials path.

`credentials.json` → OAuth credentials from Google Cloud Console.

## Setup Instructions

1. Navigate to the folder
```bash
cd transcription
```
2. Install dependencies
```bash
pip install requests python-dotenv
```

## Configuration

### Edit `config.py`:

`OPENAI_API_URL` → Endpoint of your OpenAI-compatible service.

`OPENAI_MODEL` → Model name (e.g., gpt-3.5-turbo).

Spreadsheet and column names.

## Environment Variables

### Create `.env` (copy from example.env):

### Edit `.env`:
```
ASSEMBLYAI_API_KEY=your_assemblyai_key    OPENAI_API_KEY=your_openai_key    GOOGLE_CREDENTIALS=credentials.json
```

## Getting API Keys

✅ OpenAI or Compatible Service

Sign up at or any OpenAI-compatible provider.

Generate an API key from your dashboard.

Set the API URL in config.py (e.g., `https://api.openai.com/v1/chat/completions`).

✅ AssemblyAI

Go to [AssemblyAI](https://www.assemblyai.com/).

Create an account and generate an API key.

Add it to .env as `ASSEMBLYAI_API_KEY`.

## Google Cloud Setup

### To allow the script to access Google Sheets and Google Drive, you must enable both APIs and create OAuth credentials:

Go to [Google Cloud Console](https://console.cloud.google.com/):

Create a new project (or select an existing one).

### Enable APIs:

Navigate to APIs & Services > Library.

Search for Google Sheets API → Click Enable.

Search for Google Drive API → Click Enable.

### Create OAuth credentials:

Go to APIs & Services > Credentials.

Click Create Credentials > OAuth client ID.

If prompted, configure the OAuth consent screen (choose External for testing).

For Application type, select Desktop app.

Click Create and Download the credentials JSON file.

***Rename the downloaded file to*** `credentials.json` ***and place it in the transcription folder.***

## Run the Pipeline
```bash
python transcription_pipeline.py
```

## Important Notes

 - Ensure `.env` and `credentials.json` are present in this folder.
 - SSL verification is disabled by default for environments with self-signed certificates.
 - The pipeline updates the Google Sheet with transcription and enhanced text writing on the columns provided in `config.py`, even if data in those columns are present. If the provided columns do not exist on the Google Sheet, then they are created and appended on the right.