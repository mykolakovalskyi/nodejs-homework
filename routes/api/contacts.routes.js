const express = require("express");

const router = express.Router();
const contactsManager = require("../../models/contacts");

const Joi = require("joi");
const schema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().min(9).max(14),
});

router.get("/", async (req, res, next) => {
  const contactList = await contactsManager.listContacts();
  res.status(200).json(contactList);
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contactToFind = await contactsManager.getContactById(contactId);

  if (!contactToFind) {
    return res.status(404).json({
      message: "Not found",
    });
  }

  res.status(200).json({ contactToFind });
});

router.post("/", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  const { name, email, phone } = value;

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (!name || !email || !phone) {
    return res.status(400).json({
      message: "Missing field",
    });
  }

  const newContact = await contactsManager.addContact(name, email, phone);

  res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contacts = await contactsManager.listContacts();

  const newContacts = await contactsManager.removeContact(contactId);

  if (newContacts.length === contacts.length) {
    return res.status(404).json({
      message: "Not found",
    });
  }

  res.status(200).json({
    message: `Contact with ID=${contactId} deleted successfully!`,
  });
});

router.put("/:contactId", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  const { contactId } = req.params;
  const { name, email, phone } = value;

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (!name && !email && !phone) {
    return res.status(400).json({
      message: "Missing fields",
    });
  }

  const updatedContact = await contactsManager.updateContact(
    contactId,
    name,
    email,
    phone
  );

  if (!updatedContact) {
    return res.status(404).json({
      message: "Not found",
    });
  }

  res.status(200).json(updatedContact);
});

module.exports = router;
