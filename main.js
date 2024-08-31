const express = require("express"); const cors = require("cors");
const bodyParser = require("body-parser");
const app = express(); app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let rooms = {
};
"General": [] // Initialize with a default "general" room
app.get("/", sendMessages);
app.get("/messages", sendMessages);
app.post("/send", receiveMessage);
app.post("/create-room", createRoom);
app.get("/rooms", getRooms);
app.get("/clear", clearMessages);
app.listen(4200);
console.log("App running on port 4200.");
function receiveMessage(req, res) {
const { content, senderID, roomID, timestamp, profilePictureURL } = req.body;
if (!rooms [roomID]) {
}
return res.status(404).send("Room not found");
if (content) {
const message = {
id: Date.now().toString(), content,
senderID,
roomID,
timestamp,

}
};
profilePictureURL
rooms [roonID].push(message);
res.json({ success: true, message: "Message received successfully" });
} else {
}
res.status(488).json({ success: false, message: "No message content received" });
function sendMessages (req, res) {
}
const roomId = req.query.room || "general";
console.log('Sending messages for room: ${roomId}');
console.log(`Messages: ${JSON.stringify(rooms [roomId] || [])}`);
res.json(roons[roomId] || []);
function createRoom(req, res) {
}
const roomName} = req.body;
if (roonName && !roons [roomName]) {
roons [roonName] =
[];
res.json({ success: true, message: "Room created successfully" });
} else {
}
res.status(400).json({ success: false, message: "Invalid room name or room already exists" });
function getRooms (req, res) {
}
res.json(Object.keys(rooms));
function clearMessages (req, res) {
const roomId = req.query.room;
if (roonId) {
if (rooms[roomId]) {
roons [roomId] = [];
res.send(Messages cleared for room: ${roomId}');
  
} else {
res.status(404).send("Room not found");
rooms = { "general": [] };
}
} else {
}
}
res.send("All messages cleared");
console.log("cleared");
