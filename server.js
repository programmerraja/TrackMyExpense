const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const session = require("express-session");
require("dotenv").config();
const auth = require("./middleware/auth.js");

const passport = require("./passport");

dotenv.config({ path: "./.env" });

connectDB();

const expense = require("./routes/expense");
const priceTracking = require("./routes/priceTracking.js");

const user = require("./routes/user");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./views");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/signin", user);

app.get("/irctc", (req, res) => {
  res.render("irctc", {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_SECRET,
  });
});

app.use(
  "/api/v1/expense",
  (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      req.user = { id: "626e428e86a0c5aa48b89bc2" };
    }
    next();
  },
  auth.isAuthenticated(),
  expense
);

app.use(
  "/api/v1/price",
  (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      req.user = { id: "626e428e86a0c5aa48b89bc2" };
    }
    next();
  },
  auth.isAuthenticated(),
  priceTracking
);

if (process.env.NODE_ENV === "production") {
  app.use("/new", express.static(path.join(__dirname, "newclient/dist")));
  app.get("/new/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "newclient", "dist", "index.html"));
  });

  // Serve main client from root path
  app.use("/", express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
