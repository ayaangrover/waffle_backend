const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

let messages = [];

app.get("/", sendMessage);
app.post("/send", receiveMessage); // Updated to POST
app.get("/clear", clearMessages);

app.listen(3000);

function sendMessage(req, res) {
  res.send(JSON.stringify(messages));
}

function receiveMessage(req, res) {
  let message = req.body.message; // Extract message from request body
  if (message) {
    messages.push(message);
    res.send("Successfully received your message (" + message + ")");
  } else {
    res.send("No message received");
  }
}

function clearMessages(req, res) {
  messages = [];
  res.send("Messages cleared");
  console.log("cleared");
}
