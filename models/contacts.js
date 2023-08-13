const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");

const contactsPath = path.resolve("./models/contacts.json");

function listContacts() {
  const contacts = fs
    .readFile(contactsPath)
    .then((data) => {
      const contacts = JSON.parse(data);
      return contacts;
    })
    .catch((err) => console.log(err.message));
  return contacts;
}

function getContactById(contactId) {
  const contact = fs
    .readFile(contactsPath)
    .then((data) => {
      const contacts = JSON.parse(data);
      const contact = contacts.find((contact) => {
        if (contact.id === contactId) {
          return contact;
        }
      });

      if (contact == null) {
        return;
      }

      return contact;
    })
    .catch((err) => console.log(err.message));
  return contact;
}

function removeContact(contactId) {
  const newContacts = fs
    .readFile(contactsPath)
    .then((data) => {
      const contacts = JSON.parse(data);
      const newContacts = contacts.filter(
        (contact) => contact.id !== contactId
      );

      if (newContacts.length === contacts.length) {
        return contacts;
      }

      fs.writeFile(contactsPath, JSON.stringify(newContacts), (error) => {
        if (error) {
          return console.log("error :", error);
        }
      });
      return newContacts;
    })
    .catch((err) => console.log(err.message));
  return newContacts;
}

function addContact(name, email, phone) {
  const newContact = fs
    .readFile(contactsPath)
    .then((data) => {
      const contacts = JSON.parse(data);

      const contact = {
        id: nanoid(),
        name: name,
        email: email,
        phone: phone,
      };

      contacts.push(contact);

      fs.writeFile(contactsPath, JSON.stringify(contacts), (error) => {
        if (error) {
          return console.log(error);
        }
      });

      return contact;
    })
    .catch((err) => console.log(err.message));
  return newContact;
}

function updateContact(contactId, name, email, phone) {
  const updatedContact = fs.readFile(contactsPath).then((data) => {
    const contacts = JSON.parse(data);
    const contact = contacts.find((contact) => {
      if (contact.id === contactId) {
        contact.name = name ? name : contact.name;
        contact.email = email ? email : contact.email;
        contact.phone = phone ? phone : contact.phone;
        return contact;
      }
    });

    if (contact == null) {
      return;
    }

    fs.writeFile(contactsPath, JSON.stringify(contacts), (error) => {
      if (error) {
        return console.log(error);
      }
    });

    return contact;
  });
  return updatedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
