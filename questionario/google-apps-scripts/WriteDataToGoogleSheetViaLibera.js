function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Check if this is an update request (has originalId and secondAudioUrl)
        if (data.originalId && data.secondAudioUrl) {
            return handleSecondAudioUpdate(data);
        } else {
            // This is a regular form submission
            return handleFormSubmission(data);
        }

    } catch (error) {
        console.error('Error:', error);
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function handleSecondAudioUpdate(data) {
    // Your update logic here
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    const idColumnIndex = headers.indexOf('ID');

    // Find matching row
    let targetRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
        if (values[i][idColumnIndex] === data.originalId) {
            targetRowIndex = i + 1;
            break;
        }
    }

    if (targetRowIndex === -1) {
        throw new Error(`Row with ID ${data.originalId} not found`);
    }

    // Add/update Second Audio URL column
    let secondAudioColumnIndex = headers.indexOf('Second Audio URL');
    if (secondAudioColumnIndex === -1) {
        secondAudioColumnIndex = headers.length;
        sheet.getRange(1, secondAudioColumnIndex + 1).setValue('Second Audio URL');
    }

    sheet.getRange(targetRowIndex, secondAudioColumnIndex + 1).setValue(data.secondAudioUrl);

    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: `Row ${targetRowIndex} updated successfully`
    })).setMimeType(ContentService.MimeType.JSON);
}

function handleFormSubmission(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
        const headers = [
            'Timestamp',
            'ID',
            'UserAgent',
            'Squadra',
            'Troppo spazio per auto',
            'Trasporto pubblico inefficiente',
            'Meno auto per cambiamento climatico',
            'Normale auto per strada',
            'Più verde',
            'Aggregazione porta disturbo',
            'Da parcheggi ad aggregazione',
            'Primo posto',
            'Secondo posto',
            'Terzo posto',
            'Limitare le auto migliora o peggiora',
            'Età',
            'Lavoro',
            'Auto',
            'Bici',
            'Mezzi pubblici',
            'Piedi',
            'Moto/scooter',
            'Taxi',
            'Monopattino',
            'Altro',
            'Genere',
            'CAP',
            'Registrazione Audio Originale',
            'Trascrizione',
            'Trascrizione rivista da LLM'
        ];
        sheet.appendRow(headers);
    }

    // Prepare row data
    const rowData = [
        data.timestamp,
        data.id,
        data.userAgent,
        data.interviewer,
        data.q1,
        data.q2,
        data.q3,
        data.q4,
        data.q5,
        data.q6,
        data.q7,
        data.o1_1,
        data.o1_2,
        data.o1_3,
        data.r1,
        data.eta,
        data.lavoro,
        data.o3_1,
        data.o3_2,
        data.o3_3,
        data.o3_4,
        data.o3_5,
        data.o3_6,
        data.o3_7,
        data.o3_8,
        data.genere,
        data.cap,
        data.audioFileUrl
    ];

    // Append the row
    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({
        status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
}