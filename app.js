const mongoose = require("mongoose");
require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contacts.routes");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

const connection = mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

connection
  .then(() => {
    console.log("Database connection successful");
    app.listen(4000, () => {
      console.log("App listens on port 4000");
    });
  })
  .catch((err) => {
    console.error(`Error while establishing connection: [${err}]`);
    process.exit(1);
  });

module.exports = app;
