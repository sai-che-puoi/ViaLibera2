# ViaLibera2

Repository del questionario per il pilota di Via Libera 2. 

## 
Il questionario e' una pagina statica hostata qui su github pages e disponibile all'URL: https://sai-che-puoi.github.io/ViaLibera2/questionario

La pagina viene creata dinamicamente partendo dal file di configurazione [config.js](questionario/js/config.js).
Quando di invia il form, la funzione handle fa due cose:
1. chiama un [endpoint](https://script.google.com/home/projects/1D38nCxqOT0fnzNbGjqHGUJZdcQG2WiDJHeD210qzrI20AXAsKv1VMKgu/edit) su Google App Script con il blob audio (codificato in base64); lo script salva il file audio su google drive e restituisce l'URL del file audio salvato
2. chiama un altro [endpoint](https://script.google.com/u/0/home/projects/1Y4NMybya_z6hyLZ31yT84zCBGLzNeJN2IqskSKjUNL2TdlN9knxrCDTD/edit) su Google App Script con i dati del questionario e il file URL ottenuto dall'altro endpoint; lo script salva questi dati su un [foglio](https://docs.google.com/spreadsheets/d/1kA2w9puir-od51z3KHZwNI9q6pnsw5_RoYbvgCR8o4Y/edit?gid=0#gid=0) di google sheet

A questo punto l'interfaccia viene resettata con i valori di default e si puo' partire con un'altra intervista.


## Script per la trascrizione
Lo script per la trascrizione ha bisogno di una [API KEY](https://github.com/sai-che-puoi/ViaLibera2/blob/12dcd1c997c6b9e5c222d2467ff775d53723da78/transcription.py#L26) per AssemblyAI e di un file `credentials.json` per accedere a Google Drive. La API KEY si ottiene con una registrazione gratuita sul sito di [AssemblyAI](https://www.assemblyai.com/), mentre il file di credenziali si puo' ottenere facendo cosi':
* Go to Google Cloud Console
* Create a new project (or select an existing one)
* Enable the Google Drive API:
  * Go to "APIs & Services" > "Library"
  * Search for "Google Drive API"
  * Click "Enable"
* Create credentials:sd
    * Go to "APIs & Services" > "Credentials"
    * Click "Create Credentials" > "OAuth client ID"
    * If prompted, configure the OAuth consent screen (select "External" for testing)
    * For application type, choose "Desktop app"
    * Download the credentials JSON file
    * Rename it to credentials.json and place it in the same directory as the transcription script
