function onFormSubmit(e) {
  var form = FormApp.getActiveForm();
  var submittedTeam = e.response.getItemResponses()[0].getResponse(); // adjust index if needed

  var items = form.getItems(FormApp.ItemType.LIST);
  var dropdown = items[0]; // adjust index if you have multiple dropdowns
  var listItem = dropdown.asListItem();

  var currentChoices = listItem.getChoices();
  var newChoices = currentChoices.filter(choice => choice.getValue() !== submittedTeam);

  listItem.setChoices(newChoices);
}