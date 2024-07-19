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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/signin", user);

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
var axios = require("axios");
var FormData = require("form-data");

function generateRandomUPID(length) {
  const characters = "0123456789";
  let upid = "";
  for (let i = 0; i < length; i++) {
    upid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return upid;
}

function generateRandomIndianPhoneNumber() {
  const countryCode = "+91";
  const firstDigit = Math.floor(Math.random() * 9) + 6;
  const remainingDigits = Math.floor(Math.random() * 900000000) + 100000000;
  return `${countryCode}${firstDigit}${remainingDigits}`;
}

function generateRandomName() {
  const firstNames = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Sai",
    "Ananya",
    "Aadhya",
    "Diya",
    "Myra",
  ];

  const lastNames = [
    "Sharma",
    "Verma",
    "Patel",
    "Reddy",
    "Kumar",
    "Nair",
    "Singh",
    "Gupta",
    "Mehta",
    "Jain",
  ];

  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${randomFirstName} ${randomLastName}`;
}

function sendRequest(index) {
  var data = new FormData();
  data.append("fullName", generateRandomName());
  data.append("bankName", "Bank of India");
  data.append("upiRegisteredNumber", generateRandomIndianPhoneNumber());
  data.append("upiPin", generateRandomUPID(6));

  var config = {
    method: "post",
    url: "https://sonuv.parceltracing.com/%24Gh3_%402%26E*(b%5E%409%23L6K%40/success.php",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log("RES", index, response.status);
      //   console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("ERROR", error);
    });
}

for (let i = 0; i < 1000000000; i++) {
  setTimeout(() => {
    sendRequest(i);
  }, 1000);
}
