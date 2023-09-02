const Contact = require("../models/contact.model");

function listContacts(query) {
  const limit = query.limit;
  const page = query.page * limit;
  const filter = query.favorite
    ? {
        favorite: query.favorite,
        owner: query.owner,
      }
    : {
        owner: query.owner,
      };
  return Contact.find(filter).limit(limit).skip(page);
}

function getContactById(contactId, userId) {
  return Contact.findById({ _id: contactId, owner: userId });
}

function removeContact(contactId, userId) {
  return Contact.findByIdAndDelete({ _id: contactId, owner: userId });
}

function addContact(contactData) {
  return Contact.create(contactData);
}

function updateContact(contactId, userId, contactData) {
  return Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    contactData,
    {
      new: true,
    }
  );
}

function updateContactStatus(contactId, userId, favorite) {
  return Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
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
