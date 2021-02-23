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
  console.log(msg.msg);
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

async function logRooms() {
  try {
    const allSockets = await io.allSockets();
    for (let roomName of io.sockets.adapter.rooms.keys()) {
      if (!allSockets.has(roomName)) {
        logRoom(roomName);
      }
    }
  } catch (err) {
    console.log("couldn't log rooms:", err);
  }
}

function emitInitalGameState(room, includeTurns, socket) {
  "gameState" in room && socket.emit("game state change", room.gameState);
  "winner" in room && socket.emit("someone won", room.winner);

  if (includeTurns) {
    console.log("players:", room.players);
    console.log("filled roles:", room.filledRoles);
    "players" in room && io.to(room.name).emit("player change", room.players);
    "turnMode" in room && socket.emit("broadcast turn mode", room.turnMode);
  }
}

function initRoles(playerKey, room, roles) {
  room.turnMode = true;
  room.openRoles = roles;
  fillRole(playerKey, room);
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

  room.players = room.players || {};
  room.players[playerKey] = role;

  room.filledRoles = room.filledRoles || new Map();
  room.filledRoles.set(role, playerKey);

  room.turnIterator = room.turnIterator || makeTurnIterator(room.filledRoles);
  !room.whoseTurnIsIt && goToNextTurn(room);
}

function* makeTurnIterator(filledRoles) {
  while (true) {
    if (filledRoles.size > 0) {
      for (let role of filledRoles) {
        yield role;
      }
    } else {
      yield null;
    }
  }
}

function goToNextTurn(room) {
  if (room?.turnIterator) {
    let nextPlayer = room.turnIterator.next().value;
    room.whoseTurnIsIt = nextPlayer;

    if (nextPlayer) {
      io.to(room.name).emit("turn change", nextPlayer);
      console.log(`it's ${nextPlayer}'s turn in ${room.name}`);
    }
  } else {
    console.log("tried to go to next turn with no turn iterator");
  }
}

function leaveGame(playerKey, room) {
  let players = room?.players;

  if (players?.[playerKey]) {
    let role = players[playerKey];

    if (role !== "spectator" && room.filledRoles.get(role) === playerKey) {
      room.openRoles.push(role);
      room.filledRoles.delete(role);
      if (room.whoseTurnIsIt?.[1] === playerKey) {
        goToNextTurn(room);
      }
    }

    delete players[playerKey];
    io.to(room.name).emit("player change", players);
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
      broadcastToRoom(`${userName} joined ${roomName}!`, roomName);

      socket.emit("room joined", { roomName, userName });
      socket.emit("replace msgs", room.chat);
      logRoom(roomName);
    }
  });

  socket.on("chat joined", (roomName) => {
    if (socket.rooms.has(roomName)) {
      console.log(roomContents[roomName].chat.map((msg) => msg.msg));
      socket.emit("replace msgs", roomContents[roomName].chat);
    } else {
      console.log("tried to join chat before joining room");
    }
  });

  socket.on("game joined", ({ roomName, roles }) => {
    if (!socket.rooms.has(roomName)) {
      console.log("tried to join game before joining room");
      return;
    }
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
    let playerKey = socket.userName || socket.id;
    for (let roomName of socket.rooms) {
      let room = roomContents[roomName];
      if (room) {
        console.log(`${playerKey} is leaving ${roomName}`);
        room.chat && broadcastToRoom(`${playerKey} left.`, roomName);
        room.players && leaveGame(playerKey, room);
      }
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
