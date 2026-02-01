function onFormSubmit(e) {
  // Get the sheet where responses are stored
  var sheet = e.range.getSheet();
  var row = e.range.getRow();

  // Get the header row to find column positions
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Define the message template
  var messageTemplate = 'Ciao {nome}! Piacere sono Costanza e ti scrivo a nome di Sai che puoi? \n\n' +
    'Grazie per aver scelto di partecipare a Via libera all\'immaginazione, che si svolgerà nel weekend del 14 e 15 marzo: ' +
    'siamo davvero felici di averti con noi 🙂 È tutto confermato e nelle prossime settimane ci sentiremo per le istruzioni precise. \n\n' +
    'Per poter comunicare più facilmente, ti chiediamo di entrare in questo canale whatsapp https://chat.whatsapp.com/FAZuoSfEKsp46r5u3mPOw5. \n\n' +
    'È un gruppo chiuso, solo noi admin possiamo scrivere e vedere il tuo numero (la privacy è al sicuro!) ' +
    'e lo useremo solo per mandare le informazioni di interesse a tutte le squadre partecipanti. \n\n' +
    'Riceverai altri messaggi da questo numero e, se hai domande e dubbi, puoi scrivermi direttamente qui. \n\n' +
    'A prestissimo! ps: se non riesci a cliccare sul link, rispondi a questo messaggio con una parola qualsiasi, ' +
    'poi il link diventerà magicamente cliccabile 🙂';

  // Process both interviewers
  var interviewers = [
    {
      cellulareHeader: 'Cellulare (senza il +39)',
      nomeHeader: 'Nome',
      linkHeader: 'Link messaggio di benvenuto intervistatore 1',
      checkboxHeader: 'Messaggio di benvenuto inviato intervistatore 1'
    },
    {
      cellulareHeader: 'Il suo cellulare (senza il +39)',
      nomeHeader: 'Il suo nome',
      linkHeader: 'Link messaggio di benvenuto intervistatore 2',
      checkboxHeader: 'Messaggio di benvenuto inviato intervistatore 2'
    }
  ];

  interviewers.forEach(function(interviewer) {
    processInterviewer(sheet, row, headers, interviewer, messageTemplate);
  });
}

function processInterviewer(sheet, row, headers, interviewer, messageTemplate) {
  // Find column indices
  var cellulareCol = findColumnIndex(headers, interviewer.cellulareHeader);
  var nomeCol = findColumnIndex(headers, interviewer.nomeHeader);
  var linkCol = findColumnIndex(headers, interviewer.linkHeader);
  var checkboxCol = findColumnIndex(headers, interviewer.checkboxHeader);

  // Get values
  var nome = sheet.getRange(row, nomeCol).getValue();

  if (nome === '') {
    // Clear both link and checkbox cells if no name is provided
    sheet.getRange(row, linkCol).clearContent();
    var checkboxCell = sheet.getRange(row, checkboxCol);
    checkboxCell.clearDataValidations();
    checkboxCell.clearContent();
    return;
  }

  var cellulare = sheet.getRange(row, cellulareCol).getValue();

  // Create WhatsApp link
  var link = createWhatsAppLink(cellulare, nome, messageTemplate);

  // Write link and set up checkbox
  sheet.getRange(row, linkCol).setValue(link);
  sheet.getRange(row, checkboxCol).insertCheckboxes();
  sheet.getRange(row, checkboxCol).setValue(false);
}

function findColumnIndex(headers, headerName) {
  return headers.indexOf(headerName) + 1;
}

function createWhatsAppLink(cellulare, nome, messageTemplate) {
  // Replace placeholder with actual name
  var message = messageTemplate.replace('{nome}', nome);

  // URL encode the message
  var encodedMessage = encodeURIComponent(message);

  // Create the WhatsApp link
  return 'https://web.whatsapp.com/send?phone=39' + cellulare + '&text=' + encodedMessage;
}