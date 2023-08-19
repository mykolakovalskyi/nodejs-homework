const express = require("express");

const router = express.Router();
const contactsManager = require("../../models/contacts");

const Joi = require("joi");
const createSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.string().min(9).max(14).required(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().min(9).max(14),
}).or("name", "email", "phone");

router.get("/", async (req, res, next) => {
  try {
    const { query } = req;
    const results = await contactsManager.listContacts(query);
    res.json({
      status: "success",
      code: 200,
      data: {
        contacts: results,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contactToFind = await contactsManager.getContactById(contactId);

    if (!contactToFind) {
      res.status(404).json({
        status: "not-found",
        code: 404,
        message: "Not found",
      });
    }

    res.json({
      status: "success",
      code: 200,
      data: {
        contact: contactToFind,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: error.message,
    });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: error.message,
      });
    }

    const newContact = await contactsManager.addContact(value);

    res.json({
      status: "success",
      code: 201,
      data: {
        contact: newContact,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contacts = await contactsManager.listContacts();

    const newContacts = await contactsManager.removeContact(contactId);

    if (newContacts.length === contacts.length) {
      res.status(404).json({
        status: "not-found",
        code: 404,
        message: "Not found",
      });
    }

    res.json({
      status: "success",
      code: 200,
      message: `Contact with ID=${contactId} deleted successfully!`,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    const { contactId } = req.params;

    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: error.message,
      });
    }

    const updatedContact = await contactsManager.updateContact(
      contactId,
      value
    );

    if (!updatedContact) {
      res.status(404).json({
        status: "not-found",
        code: 404,
        message: "Not found",
      });
    }

    res.json({
      status: "success",
      code: 200,
      data: {
        contact: updatedContact,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    console.log(contactId);
    const { favorite } = req.body;

    if (!favorite) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Missing field favorite",
      });
    }

    const updatedContact = await contactsManager.updateContactStatus(
      contactId,
      favorite
    );

    if (!updatedContact) {
      res.status(404).json({
        status: "not-found",
        code: 404,
        message: "Not found",
      });
    }

    res.json({
      status: "success",
      code: 200,
      data: {
        contact: updatedContact,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
