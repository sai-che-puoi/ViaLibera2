# ViaLibera2

Repository del questionario per il pilota di Via Libera 2. 

Il questionario e' una pagina statica hostata qui su github pages e disponibile all'URL: https://sai-che-puoi.github.io/ViaLibera2/questionario

## Script per la trascrizione
Lo script per la trascrizione ha bisogno di una [API KEY](https://github.com/sai-che-puoi/ViaLibera2/blob/12dcd1c997c6b9e5c222d2467ff775d53723da78/transcription.py#L26) per AssemblyAI e di un file `credentials.json` per accedere a Google Drive. La API KEY si ottiene con una registrazione gratuita sul sito di [AssemblyAI](https://www.assemblyai.com/), mentre il file di credenziali si puo' ottenere facendo cosi':
* Go to Google Cloud Console
* Create a new project (or select an existing one)
* Enable the Google Drive API:
  * Go to "APIs & Services" > "Library"
  * Search for "Google Drive API"
  * Click "Enable"
* Create credentials:
    * Go to "APIs & Services" > "Credentials"
    * Click "Create Credentials" > "OAuth client ID"
    * If prompted, configure the OAuth consent screen (select "External" for testing)
    * For application type, choose "Desktop app"
    * Download the credentials JSON file
    * Rename it to credentials.json and place it in the same directory as the transcription script
