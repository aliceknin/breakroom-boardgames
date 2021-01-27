const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3005",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4005;

let userCount = 0;
let roomContents = new Map();

function ensureRoom(roomName) {
  roomContents[roomName] = roomContents[roomName] || {
    name: roomName,
    chat: [{ msg: `Welcome to ${roomName}!`, serverUtil: true }],
  };
}

function broadcastToRoom(msg, roomName) {
  ensureRoom(roomName);
  if (typeof msg === "string") {
    msg = { msg, roomName, serverUtil: true };
  } else {
    msg.firstFromSender = roomContents[roomName].prevSender !== msg.from;
  }
  roomContents[roomName].prevSender = msg.from;
  roomContents[roomName].chat.push(msg);
  io.to(roomName).emit("broadcast", msg);
}

io.on("connection", (socket) => {
  console.log("a user connected");
  userCount++;
  io.emit("user joined", userCount);
  console.log(io.sockets.adapter.rooms);

  socket.on("join room", (data, ack) => {
    let roomName = data.roomName;
    console.log("attemping to join", roomName, socket.rooms);
    if (!socket.rooms.has(roomName)) {
      socket.join(roomName);
      console.log(`${data.userName || ""} joined`, roomName);

      ensureRoom(roomName);
      console.log(roomContents[roomName].chat.map((msg) => msg.msg));

      ack && ack(roomContents[roomName]);
      broadcastToRoom(`${data.userName} joined ${roomName}!`, roomName);
      console.log(io.sockets.adapter.rooms);
    }
  });

  let secondsSinceConnection = 0;
  let interval = setInterval(() => {
    secondsSinceConnection++;
    socket.emit("count", secondsSinceConnection);
  }, 1000);

  socket.on("msg", (msg) => {
    broadcastToRoom(msg, msg.roomName);
    console.log(msg.msg);
  });

  socket.on("clear chat", (roomName) => {
    roomContents[roomName].chat = [];
    io.to(roomName).emit("clear chat");
  });

  socket.on("leaving room", (data, ack) => {
    socket.leave(data.roomName);
    ack && ack();
    broadcastToRoom(`${data.userName} left.`, data.roomName);
    console.log(`${data.userName || "A user"} left`, data.roomName);
    console.log(io.sockets.adapter.rooms);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    clearInterval(interval);
    userCount--;
    io.emit("user left", userCount);
  });
});

// heroku sets NODE_ENV to "production" by default,
// so this kicks in when deployed there
if (process.env.NODE_ENV === "production") {
  // make heroku redirect from http to https
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
  app.enable("trust proxy");
} else {
  app.get("/", (req, res) => {
    res.send("yo");
  });
}

server.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
