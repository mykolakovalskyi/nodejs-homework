const express = require("express");

const router = express.Router();
const contactsManager = require("../../controllers/contacts.controller");

const auth = require("../../middlewares/auth");

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

router.get("/", auth, async (req, res, next) => {
  try {
    const { query, user } = req;
    const results = await contactsManager.listContacts({
      ...query,
      owner: user._id,
    });
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

router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const { params, user } = req;
    const { contactId } = params;

    const contactToFind = await contactsManager.getContactById(
      contactId,
      user._id
    );

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

router.post("/", auth, async (req, res, next) => {
  try {
    const { body, user } = req;

    const { error, value } = createSchema.validate(body);

    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: error.message,
      });
    }

    const newContact = await contactsManager.addContact({
      ...value,
      owner: user._id,
    });

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

router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { user } = req;

    const contacts = await contactsManager.listContacts();

    const newContacts = await contactsManager.removeContact(
      contactId,
      user._id
    );

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

router.put("/:contactId", auth, async (req, res, next) => {
  try {
    const { body, user } = req;

    const { error, value } = updateSchema.validate(body);
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
      user._id,
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

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  try {
    const { body, params, user } = req;
    const { contactId } = params;
    const { favorite } = body;

    if (!favorite) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Missing field favorite",
      });
    }

    const updatedContact = await contactsManager.updateContactStatus(
      contactId,
      user._id,
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
