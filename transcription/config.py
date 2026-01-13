
# config.py
# GOOGLE SHEET CONFIGURATIONS
SPREADSHEET_ID = "160ujCYA6qijwVD0wLaHkJ0swYGPICMwsb_0aYn7rpr8"
SHEET_NAME = "Sheet1"
AUDIO_COLUMN_NAME = "Second Audio URL" #"Registrazione Audio Originale"
AUDIO_EXTENSION = "webm"
TRANSCRIPTION_COLUMN_NAME = "Trascrizione Secondo Audio" #"Trascrizione"
ENHANCED_COLUMN_NAME = "Trascrizione Secondo Audio Rivista da LLM" #"Trascrizione rivista da LLM"

# AI SERVICES
ASSEMBLYAI_API_URL = "https://api.assemblyai.com/v2"
# The following parameters are for OpenAI-compatible API, not necessarily OpenAI itself
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_MODEL = "gpt-3.5-turbo"

# Google OAuth scopes
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
]