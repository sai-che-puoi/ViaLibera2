function onFormSubmit(e) {
  // Get the sheet where responses are stored
  var sheet = e.range.getSheet();
  var row = e.range.getRow();

  // Get the header row to find column positions
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Find the column indices (1-based)
  var cellulareCol = headers.indexOf('Cellulare (senza il +39)') + 1;
  var nomeCol = headers.indexOf('Nome') + 1;
  var linkCol = headers.indexOf('Link messaggio di benvenuto') + 1;
  var checkboxCol = headers.indexOf('Messaggio di benvenuto inviato') + 1;

  // Get the values from the submitted form
  var cellulare = sheet.getRange(row, cellulareCol).getValue();
  var nome = sheet.getRange(row, nomeCol).getValue();

  // Create the message with the nome placeholder replaced
  var message = 'Ciao ' + nome + '! Piacere sono Costanza e ti scrivo a nome di Sai che puoi? \nGrazie per aver scelto di partecipare a Via libera all\'immaginazione, che si svolgerà nel weekend del 14 e 15 marzo: siamo davvero felici di averti con noi 🙂 È tutto confermato e nelle prossime settimane ci sentiremo per le istruzioni precise. \nPer poter comunicare più facilmente, ti chiediamo di entrare in questo canale whatsapp https://chat.whatsapp.com/FAZuoSfEKsp46r5u3mPOw5. \nÈ un gruppo chiuso, solo noi admin possiamo scrivere e vedere il tuo numero (la privacy è al sicuro!) e lo useremo solo per mandare le informazioni di interesse a tutte le squadre partecipanti. \nRiceverai altri messaggi da questo numero e, se hai domande e dubbi, puoi scrivermi direttamente qui. \nA prestissimo! ps: se non riesci a cliccare sul link, rispondi a questo messaggio con una parola qualsiasi, poi il link diventerà magicamente cliccabile 🙂';

  // URL encode the message
  var encodedMessage = encodeURIComponent(message);

  // Create the WhatsApp link
  var link = 'https://web.whatsapp.com/send?phone=39' + cellulare + '&text=' + encodedMessage;

  // Write the computed values
  sheet.getRange(row, linkCol).setValue(link);

  // Insert an unchecked checkbox
  sheet.getRange(row, checkboxCol).insertCheckboxes();
  sheet.getRange(row, checkboxCol).setValue(false);
}