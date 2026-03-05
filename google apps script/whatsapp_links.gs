const FORM_URL = 'https://forms.gle/RBq5dTQ6te3jtjCf6';

// Emoji defined as Unicode escapes to avoid source-file encoding corruption
const E = {
  HAND:      '\uD83D\uDC49\uD83C\uDFFD', // 👉🏽  pointing hand (medium skin)
  CARTWHEEL: '\uD83E\uDD38\uD83C\uDFFD\uFE0F', // 🤸🏽️ cartwheel (medium skin)
  WAND:      '\uD83E\uDE84', // 🪄  magic wand
};

// Column indices (0-based) — must match sheet order:
// NomeGruppo | Coppia | NIL | Data | Nome1 | Cognome1 | Telefono1 | Nome2 | Cognome2 | Telefono2 | Nome3 | Cognome3 | Telefono3
const C = {
  NOME_GRUPPO: 0, COPPIA: 1,
  NOME1: 4, COGNOME1: 5, TELEFONO1: 6,
  NOME2: 7, COGNOME2: 8, TELEFONO2: 9,
  NOME3: 10, COGNOME3: 11, TELEFONO3: 12,
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Via Libera')
    .addItem('Crea link WhatsApp', 'createWhatsAppLinks')
    .addToUi();
}

function createWhatsAppLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 1, lastRow, 13).getValues();

  // Columns layout (1-based): link1, sent1, link2, sent2, link3, sent3
  // i.e. N=14, O=15, P=16, Q=17, R=18, S=19
  sheet.getRange(1, 14).setValue('Link WA 1');
  sheet.getRange(1, 15).setValue('Inviato 1');
  sheet.getRange(1, 16).setValue('Link WA 2');
  sheet.getRange(1, 17).setValue('Inviato 2');
  sheet.getRange(1, 18).setValue('Link WA 3');
  sheet.getRange(1, 19).setValue('Inviato 3');

  const checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();

  // Find 'Link WA 1' column by reading the header row from the sheet (after headers have been written above)
  const headerRow = sheet.getRange(1, 1, 1, 19).getValues()[0];
  const linkWa1Col = headerRow.indexOf('Link WA 1') + 1; // 1-based; falls back to 14 if not found
  const skipCol = linkWa1Col > 0 ? linkWa1Col : 14;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const nomeGruppo = row[C.NOME_GRUPPO];
    if (!nomeGruppo) continue;

    const isCoppia = row[C.COPPIA] === true || String(row[C.COPPIA]).toLowerCase() === 'true';

    // Collect people present in this row
    const people = [
      { nome: row[C.NOME1], cognome: row[C.COGNOME1], telefono: row[C.TELEFONO1] },
      { nome: row[C.NOME2], cognome: row[C.COGNOME2], telefono: row[C.TELEFONO2] },
      { nome: row[C.NOME3], cognome: row[C.COGNOME3], telefono: row[C.TELEFONO3] },
    ].filter(p => p.nome);

    // Skip rows that already have links generated (check 'Link WA 1' column)
    if (sheet.getRange(i + 1, skipCol).getValue() !== '') continue;

    // Clear the 6 output columns for this row before writing
    sheet.getRange(i + 1, 14, 1, 6).clearContent().clearDataValidations();

    for (let j = 0; j < people.length; j++) {
      const person = people[j];
      const message = isCoppia
        ? buildMessageB(nomeGruppo)
        : buildMessageA(people.filter((_, k) => k !== j), nomeGruppo);

      const phone = formatPhone(person.telefono);
      const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeMessage(message)}`;

      const linkCol = 14 + j * 2;       // 14, 16, 18
      const checkCol = 14 + j * 2 + 1;  // 15, 17, 19

      const richText = SpreadsheetApp.newRichTextValue()
        .setText(`WA ${person.nome}`)
        .setLinkUrl(url)
        .build();
      sheet.getRange(i + 1, linkCol).setRichTextValue(richText);
      sheet.getRange(i + 1, checkCol).setDataValidation(checkboxRule).setValue(false);
    }
  }

  SpreadsheetApp.getUi().alert('Link WhatsApp creati con successo!');
}

// Message A — for "scoppiato" (Coppia = false)
// Sent to each person individually, listing the other(s) name(s) and phone(s)
function buildMessageA(others, nomeGruppo) {
  const partnerNames = others.map(o => `${o.nome} ${o.cognome}`).join(' e ');
  const partnerPhones = others.map(o => o.telefono).join(' e ');

  return [
    `Eccoci di nuovo! Questa volta con qualche informazione in più :) Farai le interviste sulla città con ${partnerNames}, questo è il suo numero ${partnerPhones} e la vostra squadra si chiama ${nomeGruppo}.`,
    `Avete ricevuto entrambe lo stesso messaggio: scrivetevi, sentitevi, conoscetevi! E soprattutto coordinatevi per compilare questo velocissimo form ${E.HAND} ${FORM_URL} per scegliere il luogo più comodo per voi dove ritirare i materiali che vi serviranno per fare le interviste nel weekend del 14 - 15 marzo.`,
    `${E.CARTWHEEL} Il kit di materiali da ritirare è solo uno per coppia/gruppo, quindi il form va compilato da una sola persona, e una sola persona (non necessariamente la stessa, decidete voi!) dovrà ritirarlo.`,
    `Per le info riguardo luogo assegnato e orario serve ancora qualche giorno - i maghi dell'algoritmo sono al lavoro ${E.WAND} - ma arriviamooo ;)`,
    `grazie e a prestissimo!`,
  ].join('\n\n');
}

// Message B — for "accoppiato" (Coppia = true)
// Same message for everyone in the group, only the team name changes
function buildMessageB(nomeGruppo) {
  return [
    `Eccoci di nuovo! Questa volta con qualche informazione in più :) innanzitutto con il nome della tua squadra: ${nomeGruppo}`,
    `Vi chiediamo di compilare questo velocissimo form ${E.HAND} ${FORM_URL} per scegliere il luogo più comodo per voi dove ritirare i materiali che vi serviranno per fare le interviste nel weekend del 14 - 15 marzo. Serve selezionare in alto il nome della squadra prima di compilarlo!`,
    `${E.CARTWHEEL} Il kit di materiali da ritirare è solo uno per coppia/gruppo, quindi il form va compilato da una sola persona, e una sola persona (non necessariamente la stessa, decidete voi!) dovrà ritirarlo.`,
    `Per le info riguardo luogo assegnato e orario serve ancora qualche giorno - i maghi dell'algoritmo sono al lavoro ${E.WAND} - ma arriviamooo ;)`,
    `grazie e a prestissimo!`,
  ].join('\n\n');
}

// encodeURIComponent mishandles surrogate pairs (emoji) in the Rhino runtime.
// This encoder iterates UTF-16 code units, detects surrogate pairs, reconstructs
// the full Unicode code point and percent-encodes it as a proper 4-byte UTF-8 sequence.
function encodeMessage(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const hi = str.charCodeAt(i);
    if (hi >= 0xD800 && hi <= 0xDBFF && i + 1 < str.length) {
      const lo = str.charCodeAt(i + 1);
      if (lo >= 0xDC00 && lo <= 0xDFFF) {
        i++;
        const cp = 0x10000 + (hi - 0xD800) * 0x400 + (lo - 0xDC00);
        const b1 = 0xF0 | (cp >> 18);
        const b2 = 0x80 | ((cp >> 12) & 0x3F);
        const b3 = 0x80 | ((cp >> 6) & 0x3F);
        const b4 = 0x80 | (cp & 0x3F);
        out += '%' + b1.toString(16).toUpperCase()
             + '%' + b2.toString(16).toUpperCase()
             + '%' + b3.toString(16).toUpperCase()
             + '%' + b4.toString(16).toUpperCase();
        continue;
      }
    }
    out += encodeURIComponent(str[i]);
  }
  return out;
}

// Normalise Italian mobile numbers to international format (no leading +)
// e.g. "335 719 9791" → "39335719791"
function formatPhone(phone) {
  let n = String(phone).replace(/[\s\-\.\(\)]/g, '');
  if (n.startsWith('+')) {
    n = n.slice(1);
  } else if (n.startsWith('00')) {
    n = n.slice(2);
  } else if (!n.startsWith('39')) {
    n = '39' + n;
  }
  return n;
}
