// ============================================================
// Messaggio 4 – Via Libera all'Immaginazione
// Adds a menu to generate WhatsApp message links for each row
// where "Messaggio 4 - 1" is still empty.
// ============================================================

var LUOGHI_JSON_URL = "https://raw.githubusercontent.com/sai-che-puoi/ViaLibera2/refs/heads/main/luoghi/luoghi_parsed.json";

var COUNTRY_PREFIX    = "+39";

var MESSAGE_TEMPLATE =
  "Ciao, ci siamo quasi! Tra una settimana saremo in tutte le strade a raccogliere 1000 desideri per Milano\uD83D\uDCA5 \n\n" +
  "\uD83D\uDCCDQui le informazioni riguardo orario e luogo: per le interviste di Via Libera all\u2019Immaginazione ti chiediamo di essere in LUOGO [LINK MAPS], ORARIO.\n\n" +
  "\uD83C\uDFADhttps://youtu.be/izqeFaMFzoc : ecco invece il video dove ti raccontiamo come funzioner\u00e0 il prossimo weekend!\n" +
  "Quando hai tempo guardalo e se poi hai delle domande, scrivici :)\n\n" +
  "Nei prossimi giorni ti manderemo anche il link del questionario che faremo alle persone che incontreremo in strada, intanto puoi vedere come funziona nel video!\n\n" +
  "Se hai altri dubbi, scrivici! E carichiiii \uD83D\uDE42";

// ------------------------------------------------------------
// Menu
// ------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Via Libera")
    .addItem("Genera Messaggio 4", "generaMessaggio4")
    .addToUi();
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
function generaMessaggio4() {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data   = sheet.getDataRange().getValues();
  var header = data[0];

  // Map column names to indices
  var col = {};
  header.forEach(function(name, i) { col[name] = i; });

  var required = ["ID NIL", "Data", "Telefono1", "Telefono2", "Messaggio 4 - 1", "Messaggio 4 - 2", "NIL Assegnato"];
  var missing = required.filter(function(c) { return col[c] === undefined; });
  if (missing.length > 0) {
    SpreadsheetApp.getUi().alert("Colonne non trovate nel foglio:\n" + missing.join(", "));
    return;
  }

  // Fetch and index the luoghi JSON
  var luoghi = fetchLuoghi();
  if (!luoghi) return; // error already shown

  var updated = 0;
  var usedNilMap = {};

  for (var r = 1; r < data.length; r++) {
    var row = data[r];

    // Skip if Messaggio 4 - 1 already filled
    if (row[col["Messaggio 4 - 1"]] !== "" && row[col["Messaggio 4 - 1"]] !== null) continue;

    var idNil    = row[col["ID NIL"]];
    var data_val = row[col["Data"]];
    var tel1     = row[col["Telefono1"]];
    var tel2     = row[col["Telefono2"]];

    // Look up LUOGO and LINK MAPS, using title1/link1 on first use and title2/link2 on second
    var luogoEntry = luoghi[idNil];
    var luogo, linkMaps, nilSlot;
    if (!luogoEntry) {
      Logger.log("Riga " + (r + 1) + ": nessun luogo trovato per ID NIL = " + idNil);
      luogo    = "(luogo non trovato per ID " + idNil + ")";
      linkMaps = "";
      nilSlot  = "";
    } else if (!usedNilMap[idNil]) {
      luogo           = luogoEntry.title1;
      linkMaps        = luogoEntry.link1;
      nilSlot         = "1";
      usedNilMap[idNil] = true;
    } else {
      luogo    = luogoEntry.title2;
      linkMaps = luogoEntry.link2;
      nilSlot  = "2";
    }

    // Extract ORARIO from Data string: "Domenica 15 marzo ore 15:00 - 16:30" → "Domenica 15 marzo dalle 15:00 alle 16:30"
    var dataStr = String(data_val);
    var oreParts = dataStr.split(" ore ");
    var orario = dataStr;
    if (oreParts.length > 1) {
      var dayPart = oreParts[0].trim();
      var timeParts = oreParts[1].split(" - ");
      orario = timeParts.length > 1
        ? dayPart + " dalle " + timeParts[0].trim() + " alle " + timeParts[1].trim()
        : dayPart + " ore " + oreParts[1].trim();
    }

    var testo = MESSAGE_TEMPLATE
      .replace("LUOGO",       luogo)
      .replace("[LINK MAPS]", linkMaps)
      .replace("ORARIO",      orario);

    var encodedText = encodeURIComponent(testo);

    // Build WhatsApp links and write as rich text hyperlinks (always clickable, no formula parsing)
    if (tel1) {
      var link1 = buildWhatsAppLink(tel1, encodedText);
      setHyperlink(sheet.getRange(r + 1, col["Messaggio 4 - 1"] + 1), link1, "WhatsApp " + sanitizePhone(tel1));
    }
    if (tel2) {
      var link2 = buildWhatsAppLink(tel2, encodedText);
      setHyperlink(sheet.getRange(r + 1, col["Messaggio 4 - 2"] + 1), link2, "WhatsApp " + sanitizePhone(tel2));
    }

    if (nilSlot) {
      var nilRange = sheet.getRange(r + 1, col["NIL Assegnato"] + 1);
      nilRange.setRichTextValue(SpreadsheetApp.newRichTextValue().setText(String(idNil) + " - " + nilSlot).build());
    }

    updated++;
  }

  SpreadsheetApp.getUi().alert("Fatto! Messaggi generati per " + updated + " righe.");
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function fetchLuoghi() {
  try {
    var response = UrlFetchApp.fetch(LUOGHI_JSON_URL);
    var json     = JSON.parse(response.getContentText());
    // Index by id for O(1) lookup
    var map = {};
    json.forEach(function(item) {
      map[item.id] = { title1: item.title1, link1: item.link1, title2: item.title2, link2: item.link2 };
    });
    return map;
  } catch (e) {
    SpreadsheetApp.getUi().alert("Errore nel recupero del file luoghi:\n" + e.message);
    return null;
  }
}

function sanitizePhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function buildWhatsAppLink(phone, encodedText) {
  var number = COUNTRY_PREFIX + sanitizePhone(phone);
  return "https://web.whatsapp.com/send?phone=" + number + "&text=" + encodedText;
}

function setHyperlink(range, url, label) {
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(label)
    .setLinkUrl(url)
    .build();
  range.setRichTextValue(richText);
}
