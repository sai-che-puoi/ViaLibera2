// ============================================================
// Messaggio 5 – Via Libera all'Immaginazione
// Adds a menu to generate WhatsApp message links for each row
// where "Messaggio 5 - 1" is still empty.
// ============================================================

var COUNTRY_PREFIX    = "+39";

var MESSAGE_TEMPLATE_5 =
  "Manca pochissimooooo! Noi siamo cariche 💥 pioggia o sole pronte per raccogliere i 1000 desideri per Milano\n\n" +
  "🥁 https://saichepuoi.it/intervista ecco il link al questionario che userai per fare le interviste! Se non l'hai ancora fatto puoi scoprire come usarlo nel video della formazione :)\n\n" +
  "Mi raccomando prima di iniziare la prima intervista selezione il nome della tua squadra: NOME SQ\n\n" +
  "PS se non hai ancora ritirato il kit sei in tempo per farlo fino a venerdì nel luogo che hai scelto oppure venerdì sera dalle 19 alle 21 da Linearetta\n\n" +
  "A prestissimo 🏄‍♀️";

// ------------------------------------------------------------
// Menu
// ------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Via Libera")
    .addItem("Genera Messaggio 5", "generaMessaggio5")
    .addToUi();
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
function generaMessaggio5() {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data   = sheet.getDataRange().getValues();
  var header = data[0];

  // Map column names to indices
  var col = {};
  header.forEach(function(name, i) { col[name] = i; });

  var required = ["Telefono1", "Telefono2", "NomeGruppo", "Messaggio 5 - 1", "Messaggio 5 - 2"];
  var missing = required.filter(function(c) { return col[c] === undefined; });
  if (missing.length > 0) {
    SpreadsheetApp.getUi().alert("Colonne non trovate nel foglio:\n" + missing.join(", "));
    return;
  }

  var updated = 0;

  for (var r = 1; r < data.length; r++) {
    var row = data[r];

    // Skip if Messaggio 5 - 1 already filled
    if (row[col["Messaggio 5 - 1"]] !== "" && row[col["Messaggio 5 - 1"]] !== null) continue;

    var tel1      = row[col["Telefono1"]];
    var tel2      = row[col["Telefono2"]];
    var nomeGruppo = row[col["NomeGruppo"]];

    var testo = MESSAGE_TEMPLATE_5.replace("NOME SQ", nomeGruppo);
    var encodedText = encodeURIComponent(testo);

    if (tel1) {
      var link1 = buildWhatsAppLink5(tel1, encodedText);
      setHyperlink5(sheet.getRange(r + 1, col["Messaggio 5 - 1"] + 1), link1, "WhatsApp " + sanitizePhone5(tel1));
    }
    if (tel2) {
      var link2 = buildWhatsAppLink5(tel2, encodedText);
      setHyperlink5(sheet.getRange(r + 1, col["Messaggio 5 - 2"] + 1), link2, "WhatsApp " + sanitizePhone5(tel2));
    }

    updated++;
  }

  SpreadsheetApp.getUi().alert("Fatto! Messaggi generati per " + updated + " righe.");
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function sanitizePhone5(phone) {
  return String(phone).replace(/\D/g, "");
}

function buildWhatsAppLink5(phone, encodedText) {
  var number = COUNTRY_PREFIX + sanitizePhone5(phone);
  return "https://web.whatsapp.com/send?phone=" + number + "&text=" + encodedText;
}

function setHyperlink5(range, url, label) {
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(label)
    .setLinkUrl(url)
    .build();
  range.setRichTextValue(richText);
}