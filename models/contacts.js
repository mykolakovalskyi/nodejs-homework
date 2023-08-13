const Contact = require("./contact.model");

function listContacts() {
  return Contact.find();
}

function getContactById(contactId) {
  return Contact.findById(contactId);
}

function removeContact(contactId) {
  return Contact.findByIdAndDelete(contactId);
}

function addContact(contactData) {
  return Contact.create(contactData);
}

function updateContact(contactId, contactData) {
  return Contact.findByIdAndUpdate(contactId, contactData, {
    new: true,
  });
}

function updateContactStatus(contactId, favorite) {
  return Contact.findByIdAndUpdate(
    contactId,
    { favorite },
    {
      new: true,
    }
  );
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateContactStatus,
};
