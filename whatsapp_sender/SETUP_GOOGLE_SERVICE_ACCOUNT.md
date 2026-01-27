# Configurazione Google Sheets API (Service Account)

Segui questi passaggi per configurare il bot e permettere allo script Python di interagire con i tuoi fogli Google.

NOTA: Questo bot può essere riutilizzato per altri script/sheet, non solo per
questo progetto specifico. In aggiunta, qui gli diamo permessi per Google Sheet,
ma si può espandere (o se ne possono fare altri).

---

### 1. Creazione del Progetto e delle Credenziali (Google Cloud Console)

1. **Accedi alla Console**: Vai su [Google Cloud Console](https://console.cloud.google.com/).
2. **Crea Progetto**: Clicca sul selettore dei progetti in alto a sinistra e seleziona **"Nuovo progetto"**. Nominalo a piacere (es. `Sheet-Automation`).
3. **Abilita le API**:
   - Cerca **"Google Sheets API"** nella barra di ricerca in alto e clicca su **Abilita**.
   - Cerca **"Google Drive API"** e clicca su **Abilita**.
4. **Crea l'Account di Servizio (Bot)**:
   - Vai in **API e servizi > Credenziali**.
   - Clicca su **"+ Crea credenziali"** > **Account di servizio**.
   - Inserisci un nome (es. `my-sheet-bot`) e clicca su **Crea e continua**.
   - Clicca su **Fine** (i ruoli opzionali non sono necessari).
5. **Genera la Chiave JSON**:
   - Nella tabella "Account di servizio", clicca sull'email del bot creato.
   - Vai nella tab **Chiavi**.
   - Clicca su **Aggiungi chiave** > **Crea nuova chiave** > Seleziona **JSON** > **Crea**.
   - Verrà scaricato un file sul tuo PC. Rinominalo in `credentials.json` e inseriscilo in questa cartella.

---

### 2. Autorizzazione del Bot sul Foglio Google

Il bot non può accedere ai tuoi file finché non lo inviti esplicitamente.

1. Apri il file `credentials.json` con un editor di testo.
2. Copia l'indirizzo email indicato alla voce `"client_email"` (es. `bot-nome@progetto.iam.gserviceaccount.com`).
3. Apri il tuo **Google Sheet** nel browser.
4. Clicca su **Condividi** (in alto a destra).
5. Incolla l'email del bot, impostalo come **Editor** e clicca su **Invia**.
