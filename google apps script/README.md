Questa cartella contiene una copia del codice che gira su Google Apps Script per caricare su una cartella i file audio registrati dalla pagina web.

Nello script va inserito l'ID della cartella di Google Drive su cui vanno caricati gli audio. L'utente Google che esegue lo script deve avere accesso in scittura alla cartella.

L'utilizzo di questa API è analogo a quello descritto in `GoogleSheetAPI.js` e infatti la stessa classe può essere usata senza nessun cambiamento.
Ad esempio, in `QuizController`:

```js
const mimeType = 'audio/m4a';
const base64Data = // PUT HERE THE AUDIO FILE CONVERTED TO BASE64

const submissionAudio = {
  questionId: this.ui.id,
  fileData: base64Data,
  mimeType: mimeType
};
```

```js
// Create the api object, assume audioconfig is in config.js
this.audioapi = new GoogleSheetsAPI(audioconfig);
// Send the audio to Google Apps Script
await this.api.audioapi(submissionAudio);
```

---

In seguito una piccola guida per deployare il codice su Google App Script

---


# Google Apps Script Web App Guide (For Backend Upload + Drive Storage)

This document explains how to use Google Apps Script as a backend server for accepting POST requests (including file uploads) from GitHub Pages, mobile web forms, Postman or python scripts.

This is the official pattern we will use for our forms + audio storage.

---

## 1) Create Google Apps Script Project

1. Go to https://script.google.com/
2. New Project
3. Paste your backend code you find in `upload_audio.js`

## 2) Deploy as Web App

**Deploy → New deployment**

| Option | Value |
|--------|-------|
| Type | Web app |
| Execute as | **Me (your Google account)** |
| Who has access | **Anyone** |

→ Deploy  
→ COPY the URL ending in `/exec`

This is now a real REST API endpoint.

> Every time you update code → Deploy → Manage deployments → Edit → UPDATE (do NOT create new deployment each time)

## TL;DR

> Build backend in GAS → Deploy as Web App → Execute as ME → Access ANYONE → use `/exec` URL as your API endpoint → GAS saves data/files to Drive / Sheets.
