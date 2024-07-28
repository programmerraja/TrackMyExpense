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

const user = require("./routes/user");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./views");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/signin", user);

app.get("/irctc", auth.isAuthenticated(), (req, res) => {
  res.render("irctc", {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_SECRET,
  });
});

app.use(
  "/api/v1/expense",
  (req, res, next) => {
    // if (process.env.NODE_ENV === "development") {
    //   req.user = { id: "123" };
    // }
    next();
  },
  auth.isAuthenticated(),
  expense
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
