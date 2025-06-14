const express = require("express");
const moment = require("moment");
// const { getAccessToken } = require("./app");
const axios = require("axios");
const router = express.Router();

async function getAccessToken() {
  const consumer_key = "gbsAqGI1naOFREA62UgeCmqoAwVka5Vyv2AaGeyOGKf2f0jo"; // REPLACE IT WITH YOUR CONSUMER KEY
  const consumer_secret =
    "wyKm2BhAMKACzqN2zZ39KAGfP5zYCMhfVlrqZKZhCsGIIVi6CFDCyThcFgqUEAGs"; // REPLACE IT WITH YOUR CONSUMER SECRET
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

//ACCESS TOKEN ROUTE
router.get("/api/access_token", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.send("😀 Your access token is " + accessToken);
    })
    .catch(console.log);
});

router.get("/api/home", (req, res) => {
  res.json({ message: "This is a sample API route.2" });
});

router.post("/api/stkpush", (req, res) => {
  const phoneNumber = req.body.phone;
  const amount = req.body.amount;
  const accountNumber = req.body.accountNumber;

  console.log("Phone Number:", phoneNumber);
  console.log("Amount:", amount);
  console.log("Account Number:", accountNumber);

  // Echo the received data
  getAccessToken()
    .then((accessToken) => {
      const url =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      const auth = "Bearer " + accessToken;
      const timestamp = moment().format("YYYYMMDDHHmmss");
      const password = new Buffer.from(
        "174379" +
          "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
          timestamp,
      ).toString("base64");

      axios
        .post(
          url,
          {
            BusinessShortCode: "174379",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount, //amount to be paid
            PartyA: phoneNumber, //phone number to receive the stk push
            PartyB: "174379",
            PhoneNumber: phoneNumber, //phone number to receive the stk push
            CallBackURL: "https://69e4-102-0-11-18.ngrok-free.app/api/callback",
            AccountReference: accountNumber,
            TransactionDesc: "Mpesa Daraja API stk push test",
          },
          {
            headers: {
              Authorization: auth,
            },
          },
        )
        .then((response) => {
          //   res.send("😀 Request is successful done ✔✔. Please enter mpesa pin to complete the transaction");

          //send a json data
          res.json({
            ResponseCode: "0",
            ResponseDesc: "Success",
            CustomerMessage:
              "Request accepted for processing. Please enter your M-Pesa PIN to complete the transaction.",
          });
        })
        .catch((error) => {
          console.log(error);
          //res.status(500).send("❌ Request failed");

          res.json({
            ResponseCode: "1",
            ResponseDesc: "Failed: Error",
            CustomerMessage: "Request failed. Please try again later.",
          });
        });
    })
    .catch(console.log);
});

router.post("/api/callback", (req, res) => {
  console.log("STK PUSH CALLBACK");
  const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
  const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
  const resultCode = req.body.Body.stkCallback.ResultCode;
  const resultDesc = req.body.Body.stkCallback.ResultDesc;
  const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
  const amount = callbackMetadata.Item[0].Value;
  const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
  const transactionDate = callbackMetadata.Item[3].Value;
  const phoneNumber = callbackMetadata.Item[4].Value;

  console.log("MerchantRequestID:", merchantRequestID);
  console.log("CheckoutRequestID:", checkoutRequestID);
  console.log("ResultCode:", resultCode);
  console.log("ResultDesc:", resultDesc);

  console.log("Amount:", amount);
  console.log("MpesaReceiptNumber:", mpesaReceiptNumber);
  console.log("TransactionDate:", transactionDate);
  console.log("PhoneNumber:", phoneNumber);

  var json = JSON.stringify(req.body);
  fstat.writeFile("stkcallback.json", json, "utf8", function(err){
    if(err){
        return console.log(err);
    }
    console.log("STK PUSH CALLBACK STORED SUCCESSFULLY");
    
  })
});

module.exports = router;
