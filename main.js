const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let rooms = {
  General: { messages: [], members: [] },
};

app.get("/", sendMessages);
app.get("/messages", sendMessages);
app.post("/send", receiveMessage);
app.post("/create-room", createRoom);
app.get("/rooms", getRooms);
app.get("/clear", clearMessages);
app.post("/edit-room-members", editRoomMembers);
app.get("/room-members", checkRoomMembership);

app.listen(4200, () => {
  console.log("App running on port 4200.");
});

function receiveMessage(req, res) {
  const { content, senderID, roomID, timestamp, profilePictureURL } = req.body;
  const userEmail = req.query.userEmail; // Add this line to get the user's email

  if (!rooms[roomID]) {
    return res.status(404).send("Room not found");
  }

  if (roomID !== "General" && !rooms[roomID].members.includes(userEmail)) {
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
  const userEmail = req.query.userEmail;
  console.log(`Received request for room: ${roomId}, userEmail: ${userEmail}`);

  if (!rooms[roomId]) {
    console.log(`Room not found: ${roomId}`);
    return res.status(404).send("Room not found");
  }

  console.log(`Room members: ${JSON.stringify(rooms[roomId].members)}`);

  if (roomId !== "General" && !rooms[roomId].members.includes(userEmail)) {
    console.log(`User ${userEmail} not authorized to access room ${roomId}`);
    return res.status(403).send("User not authorized to access this room");
  }

  console.log(`Sending messages for room: ${roomId}`);
  console.log(`Messages: ${JSON.stringify(rooms[roomId].messages || [])}`);
  res.json(rooms[roomId].messages || []);
}

function createRoom(req, res) {
  const { roomName, creatorEmail, memberEmails } = req.body;
  if (roomName && !rooms[roomName]) {
    rooms[roomName] = {
      messages: [],
      members: Array.from(
        new Set([
          creatorEmail,
          ...(Array.isArray(memberEmails) ? memberEmails : []),
        ]),
      ),
    };
    console.log(
      `Room created: ${roomName}, Members: ${rooms[roomName].members}`,
    );
    res.json({ success: true, message: "Room created successfully" });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid room name or room already exists",
    });
  }
}

function getRooms(req, res) {
  const userEmail = req.query.userEmail;
  console.log(`Fetching rooms for user: ${userEmail}`);
  const accessibleRooms = Object.keys(rooms).filter(
    (roomName) =>
      roomName === "General" || rooms[roomName].members.includes(userEmail),
  );
  console.log(`Accessible rooms for ${userEmail}: ${accessibleRooms}`);
  res.json(accessibleRooms);
}

function clearMessages(req, res) {
  const roomId = req.query.room;
  const userEmail = req.query.userEmail;

  if (roomId) {
    if (rooms[roomId]) {
      if (rooms[roomId].members.includes(userEmail)) {
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
  const { roomId, userEmail, newMemberEmails } = req.body;

  if (!rooms[roomId]) {
    return res.status(404).send("Room not found");
  }

  if (!rooms[roomId].members.includes(userEmail)) {
    return res.status(403).send("User not authorized to edit room members");
  }

  rooms[roomId].members = [
    ...new Set([...rooms[roomId].members, ...newMemberEmails]),
  ];
  res.json({ success: true, message: "Room members updated successfully" });
}

function checkRoomMembership(req, res) {
  const { roomId, userEmail } = req.query;
  console.log(`Checking membership for room: ${roomId}, user: ${userEmail}`);

  if (!rooms[roomId]) {
    console.log(`Room not found: ${roomId}`);
    return res.status(404).json({ error: "Room not found" });
  }

  if (roomId === "General" || rooms[roomId].members.includes(userEmail)) {
    console.log(`User ${userEmail} is a member of room ${roomId}`);
    res.status(200).json({ members: rooms[roomId].members });
  } else {
    console.log(`User ${userEmail} is NOT a member of room ${roomId}`);
    res.status(403).json({ error: "User is not a member of this room" });
  }
}
