/*
  Author: Alvin Kiveu
  Description: Mpesa Daraja API with Node JS
  Date: 23/10/2023
  Github Link: https://github.com/alvin-kiveu/Mpesa-Daraja-Api-NODE.JS.git
  Website: www.umeskiasoftwares.com
  Email: info@umeskiasoftwares.com
  Phone: +254113015674
  
*/

const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const axios = require("axios"); // Import 'axios' instead of 'request'
const moment = require("moment");
const apiRouter = require('./api');
const cors = require("cors");
const fs = require("fs");


const port = 5000;
const hostname = "localhost";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', apiRouter);

const server = http.createServer(app);

// ACCESS TOKEN FUNCTION - Updated to use 'axios'
async function getAccessToken() {
  const consumer_key = "gbsAqGI1naOFREA62UgeCmqoAwVka5Vyv2AaGeyOGKf2f0jo"; // REPLACE IT WITH YOUR CONSUMER KEY
  const consumer_secret = "wyKm2BhAMKACzqN2zZ39KAGfP5zYCMhfVlrqZKZhCsGIIVi6CFDCyThcFgqUEAGs"; // REPLACE IT WITH YOUR CONSUMER SECRET
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth =
    "Basic " +
    new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
   
    const dataresponse = response.data;
    // console.log(data);
    const accessToken = dataresponse.access_token;
    return accessToken;
  } catch (error) {
    throw error;
  }
}

app.get("/", (req, res) => {
  res.send("MPESA DARAJA API WITH NODE JS BY UMESKIA SOFTWARES wagwan");
  var timeStamp = moment().format("YYYYMMDDHHmmss");
  console.log(timeStamp);
});


//ACCESS TOKEN ROUTE
app.get("/access_token", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.send("😀 Your access token is " + accessToken);
    })
    .catch(console.log);
});

//MPESA STK PUSH ROUTE
app.get("/stkpush", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      const url =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      const auth = "Bearer " + accessToken;
      const timestamp = moment().format("YYYYMMDDHHmmss");
      const password = new Buffer.from(
        "174379" +
          "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
          timestamp
      ).toString("base64");

      axios
        .post(
          url,
          {
            BusinessShortCode: "174379",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: "1",
            PartyA: "254790163849", //phone number to receive the stk push
            PartyB: "174379",
            PhoneNumber: "254790163849",
            CallBackURL: "https://69e4-102-0-11-18.ngrok-free.app/callback",
            AccountReference: "UMESKIA PAY",
            TransactionDesc: "Mpesa Daraja API stk push test",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          res.send("😀 Request is successful done ✔✔. Please enter mpesa pin to complete the transaction");
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

//STK PUSH CALLBACK ROUTE
app.post("/callback", (req, res) => {
  console.log("STK PUSH CALLBACK");
  const CheckoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
  const ResultCode = req.body.Body.stkCallback.ResultCode;
  var json = JSON.stringify(req.body);
  fs.writeFile("stkcallback.json", json, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("STK PUSH CALLBACK JSON FILE SAVED");
  });
  console.log(req.body);
});

// REGISTER URL FOR C2B
app.get("/registerurl", (req, resp) => {
  getAccessToken()
    .then((accessToken) => {
      const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            ShortCode: "174379",
            ResponseType: "Completed",
            ConfirmationURL: "https://2bbb-197-248-144-15.ngrok-free.app/confirmation",
            ValidationURL: "https://2bbb-197-248-144-15.ngrok-free.app/validation",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          resp.status(200).json(response.data);
        })
        .catch((error) => {
          console.log(error);
          resp.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

app.get("/confirmation", (req, res) => {
  console.log("All transaction will be sent to this URL");
  console.log(req.body);
});

app.get("/validation", (req, resp) => {
  console.log("Validating payment");
  console.log(req.body);
});

// B2C ROUTE OR AUTO WITHDRAWAL
app.post("/b2curlrequest", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      const securityCredential =
      "jyMyPJ/TdYQmBVbge0iI2Pgx6zsmr/ahxqkGuEHRxOb/Le+7KEE6tu5xfek6FfM9xrhkWFrLpxqxilXyre2QUOkkuGYGvslP734lpidtEfLrVANDnFoGmhvl0DNggdeRLtUrxf5mMX1R0Cm3GnoGzBTDKC7X7QAD7vFEVaezYdZzJdN8MHBr+cS59Sr354hodVQVRpz420b+2b9igI4jBAUwWilums2Mb8YMMkds+9FQH79hsvMuZX5kwU4D5ImSrxicKmHJDxhtmMmb22rHUDd4NrBYsQhh7ls2Zkiuh3XcOYvI8KYBI3RoKZPDPLM5StPZsqhPt8dQ/1p7ExbiEg=="
      const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            OriginatorConversationID: "52a9d5cc-eae6-4141-b8b5-c41ce36d8b9c", // Unique ID for the transaction always change it and restart the server
            InitiatorName: "testapi",
            SecurityCredential: securityCredential,
            CommandID: "PromotionPayment",
            Amount: "10",
            PartyA: "600991",
            PartyB: "254790163849",//phone number to receive the stk push
            Remarks: "Withdrawal",
            QueueTimeOutURL: "https://2bbb-197-248-144-15.ngrok-free.app/b2c/queue",
            ResultURL: "https://2bbb-197-248-144-15.ngrok-free.app/b2c/result",
            Occasion: "Withdrawal",
          },
          {
            headers: {
              Authorization: auth,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          res.status(200).json(response.data);
        })
        .catch((error) => {
          console.log("Error response:", error.response?.data);
          res.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
