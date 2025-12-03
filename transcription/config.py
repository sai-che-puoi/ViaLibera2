
# config.py
# GOOGLE SHEET CONFIGURATIONS
SPREADSHEET_ID = "1oawenZihJ31zxC12kRZ6YrZk1WOg8nr1j_8r-P1R_l8"
SHEET_NAME = "Sheet1"
AUDIO_COLUMN_NAME = "Registrazione Audio Originale"
AUDIO_EXTENSION = "1kA2w9puir-od51z3KHZwNI9q6pnsw5_RoYbvgCR8o4Y"
TRANSCRIPTION_COLUMN_NAME = "Trascrizione"
ENHANCED_COLUMN_NAME = "Trascrizione rivista da LLM"

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