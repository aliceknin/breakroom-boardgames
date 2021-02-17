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

let roomContents = {};
let userNames = {};

function ensureRoom(roomName) {
  roomContents[roomName] = roomContents[roomName] || {
    name: roomName,
    chat: [{ msg: `Welcome to ${roomName}!`, serverUtil: true }],
  };
  return roomContents[roomName];
}

function broadcastToRoom(msg, roomName) {
  let room = ensureRoom(roomName);
  if (typeof msg === "string") {
    msg = { msg, roomName, serverUtil: true };
  } else {
    msg.firstFromSender = room.prevSender !== msg.from;
  }
  room.prevSender = msg.from;
  room.chat.push(msg);
  io.to(roomName).emit("broadcast", msg);
}

function logRoom(roomName) {
  if (io.sockets.adapter.rooms.get(roomName)) {
    console.log(roomName, "=> [");
    for (let id of io.sockets.adapter.rooms.get(roomName)) {
      console.log(" ", userNames[id] || id);
    }
    console.log("]");
  }
}

function emitInitalGameState(room, includeTurns, socket) {
  socket.emit("game state change", room.gameState);
  "winner" in room && socket.emit("someone won", room.winner);

  if (includeTurns) {
    console.log("players:", room.players);
    console.log("filled roles:", room.filledRoles);
    io.to(room.name).emit("player change", room.players);
    "turnMode" in room && socket.emit("broadcast turn mode", room.turnMode);
  }
}

function initRoles(playerKey, room, roles) {
  room.turnMode = true;
  room.openRoles = roles;
  let filledRoles = fillRole(playerKey, room);
  room.turnIterator = makeTurnIterator(filledRoles);
  goToNextTurn(room);
}

function assignExistingRole(playerKey, room, socket) {
  let players = room.players;

  if (!players[playerKey]) {
    room.openRoles.length > 0
      ? fillRole(playerKey, room)
      : (players[playerKey] = "spectator");
  }

  socket.emit("turn change", room.whoseTurnIsIt);
}

function fillRole(playerKey, room) {
  let role = room.openRoles.pop();

  room.filledRoles = room.filledRoles || new Map();
  room.filledRoles.set(role, playerKey);

  room.players = room.players || {};
  room.players[playerKey] = role;

  return room.filledRoles;
}

function* makeTurnIterator(filledRoles) {
  while (true) {
    for (let role of filledRoles) {
      yield role;
    }
  }
}

function goToNextTurn(room) {
  room.whoseTurnIsIt = room.turnIterator.next().value;
  io.to(room.name).emit("turn change", room.whoseTurnIsIt);
  console.log(`it's ${room.whoseTurnIsIt}'s turn in ${room.name}`);
}

function leaveGame(playerKey, roomName) {
  let room = roomContents[roomName];
  let players = room.players;

  if (players && players[playerKey]) {
    let role = players[playerKey];

    if (role !== "spectator" && room.filledRoles.get(role) === playerKey) {
      room.openRoles.push(role);
      room.filledRoles.delete(role);
      if (room.whoseTurnIsIt[1] === playerKey) {
        goToNextTurn(room);
      }
    }

    delete players[playerKey];
    io.to(roomName).emit("player change", players);
  }
}

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room", ({ roomName, userName }, ack) => {
    userNames[socket.id] = userName;
    socket.userName = userName;

    if (!socket.rooms.has(roomName)) {
      let room = ensureRoom(roomName);

      socket.join(roomName);
      ack && ack(room);

      socket.emit("room joined", { roomName, userName });
      socket.emit("replace msgs", room.chat);
      logRoom(roomName);
    }
  });

  socket.on("room joined", ({ roomName, userName }) => {
    console.log(`${userName || ""} joined`, roomName);
    broadcastToRoom(`${userName} joined ${roomName}!`, roomName);
  });

  socket.on("chat joined", (roomName) => {
    console.log(roomContents[roomName].chat.map((msg) => msg.msg));
    socket.emit("replace msgs", roomContents[roomName].chat);
  });

  socket.on("game joined", ({ roomName, roles }) => {
    let room = ensureRoom(roomName);
    let playerKey = socket.userName || socket.id;

    if (room.openRoles) {
      assignExistingRole(playerKey, room, socket);
    } else {
      if (roles && roles.length > 0) {
        initRoles(playerKey, room, roles);
      } else {
        emitInitalGameState(room, false, socket);
        return;
      }
    }
    emitInitalGameState(room, true, socket);
  });

  socket.on("msg", (msg) => {
    broadcastToRoom(msg, msg.roomName);
    console.log(msg.msg);
  });

  socket.on("clear chat", (roomName) => {
    roomContents[roomName].chat = [];
    roomContents[roomName].prevSender = null;
    io.to(roomName).emit("clear chat");
  });

  socket.on("move", ({ newState, roomName }) => {
    console.log("received move");
    roomContents[roomName].gameState = newState;
    socket.to(roomName).emit("game state change", newState);
  });

  socket.on("turn ended", (roomName) => {
    let room = roomContents[roomName];
    goToNextTurn(room);
  });

  socket.on("we won", ({ player, roomName }) => {
    console.log(player, "won in ", roomName);
    roomContents[roomName].winner = player;
    socket.to(roomName).emit("someone won", player);
    if (player && roomContents[roomName].turnMode) {
      roomContents[roomName].turnMode = false;
      io.to(roomName).emit("broadcast turn mode", false);
    }
  });

  socket.on("set turn mode", ({ turnMode, roomName }) => {
    console.log("setting turn mode in", roomName, "to", turnMode);
    roomContents[roomName].turnMode = turnMode;
    socket.to(roomName).emit("broadcast turn mode", turnMode);
  });

  socket.on("disconnecting", () => {
    console.log(
      socket.userName || socket.id,
      "disconnecting from",
      socket.rooms
    );
    for (let roomName of socket.rooms) {
      let playerKey = socket.userName || socket.id;
      broadcastToRoom(`${playerKey} left.`, roomName);
      leaveGame(playerKey, roomName);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
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
