// ============================================================
//  FillCoordinates.gs
//  Installa come menu in Google Sheet → Extensions > App Script
// ============================================================

const CONFIG = {
  // Nomi dei fogli
  sheet1Name:  "Sheet1",
  coppieName:  "Coppie",
  luoghiName:  "Luoghi",

  // Nomi delle colonne su Sheet1
  s1_Squadra:   "Squadra",
  s1_Latitude:  "Latitude",
  s1_Longitude: "Longitude",

  // Nomi delle colonne su Coppie
  cop_NomeGruppo: "NomeGruppo",
  cop_NIL:        "NIL",
  cop_Luogo:      "Luogo",

  // Nomi delle colonne su Luoghi
  luo_id:         "id",
  luo_Latitude1:  "Latitude1",
  luo_Longitude1: "Longitude1",
  luo_Latitude2:  "Latitude2",
  luo_Longitude2: "Longitude2",

  // Nomi colonne di debug (create su Sheet1)
  debug_Lat:  "DEBUG_Latitude",
  debug_Lon:  "DEBUG_Longitude",
  debug_Note: "DEBUG_Note",
};

// ── Crea il menu all'apertura del foglio ─────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📍 Coordinate")
    .addItem("✅ Controlla (modalità debug)", "fillCoordinatesDebug")
    .addSeparator()
    .addItem("✏️  Scrivi nelle colonne reali", "fillCoordinatesReal")
    .addToUi();
}

// ── Modalità DEBUG ───────────────────────────────────────────
function fillCoordinatesDebug() {
  _fillCoordinates(true);
}

// ── Modalità REALE ───────────────────────────────────────────
function fillCoordinatesReal() {
  const ui = SpreadsheetApp.getUi();
  const risposta = ui.alert(
    "Sei sicuro?",
    "Questa operazione sovrascriverà le celle vuote nelle colonne Latitude e Longitude su Sheet1.",
    ui.ButtonSet.YES_NO
  );
  if (risposta !== ui.Button.YES) return;
  _fillCoordinates(false);
}

// ── Utility: costruisce una mappa { nomeColonna: indice } ────
function _buildColIndex(headerRow) {
  const map = {};
  for (let c = 0; c < headerRow.length; c++) {
    const name = String(headerRow[c]).trim();
    if (name) map[name] = c;
  }
  return map;
}

// ── Utility: verifica che tutte le colonne richieste esistano ─
function _checkCols(colIndex, required, sheetName) {
  const missing = required.filter(n => !(n in colIndex));
  if (missing.length > 0) {
    throw new Error(
      `Foglio "${sheetName}": colonne non trovate → ${missing.join(", ")}`
    );
  }
}

// ── Logica principale ────────────────────────────────────────
function _fillCoordinates(debugMode) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName(CONFIG.sheet1Name);
  const coppie = ss.getSheetByName(CONFIG.coppieName);
  const luoghi = ss.getSheetByName(CONFIG.luoghiName);

  if (!sheet1 || !coppie || !luoghi) {
    SpreadsheetApp.getUi().alert(
      "Errore: uno o più fogli non trovati.\n" +
      `Controlla i nomi: "${CONFIG.sheet1Name}", "${CONFIG.coppieName}", "${CONFIG.luoghiName}".`
    );
    return;
  }

  const data1   = sheet1.getDataRange().getValues();
  const dataCop = coppie.getDataRange().getValues();
  const dataLuo = luoghi.getDataRange().getValues();

  // Costruisci mappe indice per ogni foglio
  const idx1   = _buildColIndex(data1[0]);
  const idxCop = _buildColIndex(dataCop[0]);
  const idxLuo = _buildColIndex(dataLuo[0]);

  // Verifica che tutte le colonne necessarie esistano
  try {
    _checkCols(idx1,   [CONFIG.s1_Squadra, CONFIG.s1_Latitude, CONFIG.s1_Longitude], CONFIG.sheet1Name);
    _checkCols(idxCop, [CONFIG.cop_NomeGruppo, CONFIG.cop_NIL, CONFIG.cop_Luogo],    CONFIG.coppieName);
    _checkCols(idxLuo, [CONFIG.luo_id, CONFIG.luo_Latitude1, CONFIG.luo_Longitude1,
                        CONFIG.luo_Latitude2, CONFIG.luo_Longitude2],                CONFIG.luoghiName);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Errore di configurazione:\n\n" + e.message);
    return;
  }

  // ── Colonne debug: trova o crea su Sheet1 ───────────────────
  let debugLatColNum, debugLonColNum, debugNoteColNum; // 1-based per getRange
  if (debugMode) {
    debugLatColNum  = _getOrCreateDebugCol(sheet1, data1[0], CONFIG.debug_Lat);
    debugLonColNum  = _getOrCreateDebugCol(sheet1, data1[0], CONFIG.debug_Lon);
    debugNoteColNum = _getOrCreateDebugCol(sheet1, data1[0], CONFIG.debug_Note);
  }

  // ── Dizionario Coppie: NomeGruppo → { nil, luogo } ──────────
  const coppieMap = {};
  for (let r = 1; r < dataCop.length; r++) {
    const nome  = String(dataCop[r][idxCop[CONFIG.cop_NomeGruppo]]).trim();
    const nil   = String(dataCop[r][idxCop[CONFIG.cop_NIL]]).trim();
    const luogo = String(dataCop[r][idxCop[CONFIG.cop_Luogo]]).trim();
    if (nome) coppieMap[nome] = { nil, luogo };
  }

  // ── Dizionario Luoghi: id → { lat1, lon1, lat2, lon2 } ──────
  const luoghiMap = {};
  for (let r = 1; r < dataLuo.length; r++) {
    const id = String(dataLuo[r][idxLuo[CONFIG.luo_id]]).trim();
    if (id) {
      luoghiMap[id] = {
        lat1: dataLuo[r][idxLuo[CONFIG.luo_Latitude1]],
        lon1: dataLuo[r][idxLuo[CONFIG.luo_Longitude1]],
        lat2: dataLuo[r][idxLuo[CONFIG.luo_Latitude2]],
        lon2: dataLuo[r][idxLuo[CONFIG.luo_Longitude2]],
      };
    }
  }

  // ── Scorri Sheet1 riga per riga ──────────────────────────────
  let updated = 0, skipped = 0, errors = 0;

  for (let r = 1; r < data1.length; r++) {
    const squadra = String(data1[r][idx1[CONFIG.s1_Squadra]]).trim();
    if (!squadra) continue;

    const lat = data1[r][idx1[CONFIG.s1_Latitude]];
    const lon = data1[r][idx1[CONFIG.s1_Longitude]];
    const rowNum = r + 1; // 1-based per getRange

    // Salta le righe già compilate (sia in debug che in modalità reale)
    if (lat !== "" && lat !== null && lon !== "" && lon !== null) {
      skipped++;
      continue;
    }

    // Lookup in Coppie
    if (!coppieMap[squadra]) {
      if (debugMode) {
        sheet1.getRange(rowNum, debugLatColNum).setValue("");
        sheet1.getRange(rowNum, debugLonColNum).setValue("");
        sheet1.getRange(rowNum, debugNoteColNum).setValue(
          `❌ Squadra "${squadra}" non trovata in ${CONFIG.coppieName}`
        );
      }
      errors++;
      continue;
    }

    const { nil, luogo } = coppieMap[squadra];

    // Lookup in Luoghi
    if (!luoghiMap[nil]) {
      if (debugMode) {
        sheet1.getRange(rowNum, debugLatColNum).setValue("");
        sheet1.getRange(rowNum, debugLonColNum).setValue("");
        sheet1.getRange(rowNum, debugNoteColNum).setValue(
          `❌ NIL "${nil}" non trovato in ${CONFIG.luoghiName}`
        );
      }
      errors++;
      continue;
    }

    const luogoData = luoghiMap[nil];
    let newLat, newLon;

    if (luogo === "1") {
      newLat = luogoData.lat1;
      newLon = luogoData.lon1;
    } else if (luogo === "2") {
      newLat = luogoData.lat2;
      newLon = luogoData.lon2;
    } else {
      if (debugMode) {
        sheet1.getRange(rowNum, debugNoteColNum).setValue(
          `❌ Valore Luogo non valido: "${luogo}" (atteso 1 o 2)`
        );
      }
      errors++;
      continue;
    }

    if (debugMode) {
      sheet1.getRange(rowNum, debugLatColNum).setValue(newLat);
      sheet1.getRange(rowNum, debugLonColNum).setValue(newLon);
      sheet1.getRange(rowNum, debugNoteColNum).setValue(
        `✅ Squadra=${squadra} | NIL=${nil} | Luogo=${luogo}`
      );
    } else {
      const latColNum = idx1[CONFIG.s1_Latitude] + 1;
      const lonColNum = idx1[CONFIG.s1_Longitude] + 1;
      if (lat === "" || lat === null) sheet1.getRange(rowNum, latColNum).setValue(newLat);
      if (lon === "" || lon === null) sheet1.getRange(rowNum, lonColNum).setValue(newLon);
    }

    updated++;
  }

  // ── Riepilogo ────────────────────────────────────────────────
  const mode = debugMode ? "DEBUG" : "REALE";
  SpreadsheetApp.getUi().alert(
    `Completato (modalità ${mode})\n\n` +
    `✅ Righe elaborate: ${updated}\n` +
    `⏭️  Righe saltate (già compilate): ${skipped}\n` +
    `❌ Errori / non trovati: ${errors}\n\n` +
    (debugMode
      ? `Controlla le colonne "${CONFIG.debug_Lat}", "${CONFIG.debug_Lon}" e "${CONFIG.debug_Note}" su Sheet1.`
      : "Le coordinate sono state scritte nelle colonne Latitude e Longitude.")
  );
}

// ── Utility: trova o crea una colonna debug, restituisce numero colonna 1-based ─
function _getOrCreateDebugCol(sheet, headerRow, colName) {
  for (let c = 0; c < headerRow.length; c++) {
    if (String(headerRow[c]).trim() === colName) return c + 1;
  }
  // Non trovata: scrivila nella prima colonna libera
  const newCol = headerRow.length + 1;
  sheet.getRange(1, newCol).setValue(colName);
  headerRow.push(colName); // aggiorna l'array locale per le chiamate successive
  return newCol;
}