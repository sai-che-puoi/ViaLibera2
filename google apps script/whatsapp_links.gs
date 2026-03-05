const FORM_URL = 'https://forms.gle/RBq5dTQ6te3jtjCf6';

// Emoji defined as Unicode escapes to avoid source-file encoding corruption
const E = {
  HAND:      '\uD83D\uDC49\uD83C\uDFFD', // 👉🏽  pointing hand (medium skin)
  CARTWHEEL: '\uD83E\uDD38\uD83C\uDFFD\uFE0F', // 🤸🏽️ cartwheel (medium skin)
  WAND:      '\uD83E\uDE84', // 🪄  magic wand
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
  const lastCol = sheet.getLastColumn();

  // Build column index maps from the header row
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  function dataIdx(name) {
    const i = headerRow.indexOf(name);
    if (i === -1) throw new Error(`Colonna "${name}" non trovata nella riga di intestazione`);
    return i; // 0-based, for indexing into data[]
  }
  function colNum(name) { return dataIdx(name) + 1; } // 1-based, for getRange()

  const C = {
    NOME_GRUPPO: dataIdx('NomeGruppo'), COPPIA: dataIdx('Coppia'),
    NOME1: dataIdx('Nome1'), COGNOME1: dataIdx('Cognome1'), TELEFONO1: dataIdx('Telefono1'),
    NOME2: dataIdx('Nome2'), COGNOME2: dataIdx('Cognome2'), TELEFONO2: dataIdx('Telefono2'),
    NOME3: dataIdx('Nome3'), COGNOME3: dataIdx('Cognome3'), TELEFONO3: dataIdx('Telefono3'),
  };

  const OUT = [
    { link: colNum('Link WA 1'), inviato: colNum('Inviato 1') },
    { link: colNum('Link WA 2'), inviato: colNum('Inviato 2') },
    { link: colNum('Link WA 3'), inviato: colNum('Inviato 3') },
  ];

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();

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
    if (sheet.getRange(i + 1, OUT[0].link).getValue() !== '') continue;

    for (let j = 0; j < people.length; j++) {
      const person = people[j];
      const message = isCoppia
        ? buildMessageB(nomeGruppo)
        : buildMessageA(people.filter((_, k) => k !== j), nomeGruppo);

      const phone = formatPhone(person.telefono);
      const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeMessage(message)}`;

      const richText = SpreadsheetApp.newRichTextValue()
        .setText(`WA ${person.nome}`)
        .setLinkUrl(url)
        .build();
      sheet.getRange(i + 1, OUT[j].link).setRichTextValue(richText);
      sheet.getRange(i + 1, OUT[j].inviato).setDataValidation(checkboxRule).setValue(false);
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
