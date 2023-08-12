const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");

const contactsPath = path.resolve("./models/contacts.json");

function listContacts() {
  const contacts = fs
    .readFile(contactsPath)
    .then((data) => {
      const contacts = JSON.parse(data);
      console.log("List of contacts: ");
      console.table(contacts);
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
          console.log(`Get contact by ID ${contactId}:`);
          console.table(contact);
          return contact;
        }
      });

      if (contact == null) {
        console.log(`Contact with ID "${contactId}" not found!`);
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
        console.log(`Contact with ID "${contactId}" not found!`);
        return contacts;
      }

      console.log("Contact deleted successfully! New list of contacts: ");
      console.table(newContacts);

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

      console.log("Contacts added successfully! New lists of contacts: ");
      console.table(contacts);

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
        console.log(`Contact with ID ${contactId} updated!`);
        console.table(contacts);
        return contact;
      }
    });

    if (contact == null) {
      console.log(`Contact with ID "${contactId}" not found!`);
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
