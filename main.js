// Hosted at https://waffle.ayaangrover.hackclub.app and https://71cdac9f-034e-45b9-a14e-a52eced71d28-00-4iave9rzd7yu.worf.replit.dev/
// When updating code on Hack Club's Nest server, use "systemctl --user restart waffle_backend" to update the code and put it online again.

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let rooms = {
  General: { messages: [], members: [] }, // Initialize with a default "General" room
};

app.get("/", sendMessages);
app.get("/messages", sendMessages);
app.post("/send", receiveMessage);
app.post("/create-room", createRoom);
app.get("/rooms", getRooms);
app.get("/clear", clearMessages);
app.post("/edit-room-members", editRoomMembers);

app.listen(4200, () => {
  console.log("App running on port 4200.");
});

function receiveMessage(req, res) {
  const { content, senderID, roomID, timestamp, profilePictureURL } = req.body;

  if (!rooms[roomID]) {
    return res.status(404).send("Room not found");
  }

  if (roomID !== "General" && !rooms[roomID].members.includes(senderID)) {
    return res
      .status(403)
      .send("User not authorized to send messages in this room");
  }

  if (content) {
    const message = {
      id: Date.now().toString(),
      content,
      senderID,
      roomID,
      timestamp,
      profilePictureURL,
    };

    rooms[roomID].messages.push(message);
    res.json({ success: true, message: "Message received successfully" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "No message content received" });
  }
}

function sendMessages(req, res) {
  const roomId = req.query.room || "General";
  const userId = req.query.userId;
  if (!rooms[roomId]) {
    return res.status(404).send("Room not found");
  }
  if (roomId !== "General" && !rooms[roomId].members.includes(userId)) {
    return res.status(403).send("User not authorized to access this room");
  }
  console.log(`Sending messages for room: ${roomId}`);
  console.log(`Messages: ${JSON.stringify(rooms[roomId].messages || [])}`);
  res.json(rooms[roomId].messages || []);
}

function createRoom(req, res) {
  const { roomName, creatorId, members } = req.body;
  if (roomName && !rooms[roomName]) {
    rooms[roomName] = {
      messages: [],
      members: [creatorId, ...members],
    };
    res.json({ success: true, message: "Room created successfully" });
  } else {
    res
      .status(400)
      .json({
        success: false,
        message: "Invalid room name or room already exists",
      });
  }
}

function getRooms(req, res) {
  const userId = req.query.userId;
  const accessibleRooms = Object.keys(rooms).filter(
    (roomName) =>
      roomName === "General" || rooms[roomName].members.includes(userId),
  );
  res.json(accessibleRooms);
}

function clearMessages(req, res) {
  const roomId = req.query.room;
  const userId = req.query.userId;

  if (roomId) {
    if (rooms[roomId]) {
      if (rooms[roomId].members.includes(userId)) {
        rooms[roomId].messages = [];
        res.send(`Messages cleared for room: ${roomId}`);
      } else {
        res
          .status(403)
          .send("User not authorized to clear messages in this room");
      }
    } else {
      res.status(404).send("Room not found");
    }
  } else {
    res.status(400).send("Room ID is required");
  }
  console.log("cleared");
}

function editRoomMembers(req, res) {
  const { roomId, userId, newMembers } = req.body;

  if (!rooms[roomId]) {
    return res.status(404).send("Room not found");
  }

  if (!rooms[roomId].members.includes(userId)) {
    return res.status(403).send("User not authorized to edit room members");
  }

  rooms[roomId].members = [
    ...new Set([...rooms[roomId].members, ...newMembers]),
  ];
  res.json({ success: true, message: "Room members updated successfully" });
}
