const express = require("express");
const router = express.Router();
const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const auth = require("../../middlewares/auth");

const emailRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter"),
});

const logInSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business"),
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = logInSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.validPassword(password)) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Incorrect login or password",
        data: "Unauthorized",
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const secret = process.env.SECRET_KEY;
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    return res.json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
router.post("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
});
router.post("/signup", async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password, subscription } = req.body;
    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }
    const newUser = new User({ email, subscription });
    newUser.setPassword(password);
    await newUser.save();
    return res.status(201).json({
      status: "success",
      code: 201,
      data: {
        message: "Registration successful",
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/curent", auth, async (req, res, next) => {
  const { email, phone, subscription } = req.user;
  return res.json({ email, phone, subscription });
});

router.patch("/subscription", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Missing subscription option" });
    }
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      status: "success",
      code: 200,
      data: {
        message: "Subscription updated",
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
