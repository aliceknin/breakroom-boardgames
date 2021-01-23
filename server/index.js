const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3005",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4005;

app.get('/', (req, res) => {
    res.send("yo");
});

let userCount = 0;

io.on('connection', (socket) => {
    console.log('a user connected');
    userCount++;
    io.emit("user joined", userCount);

    let secondsSinceConnection = 0;
    let interval = setInterval(() => {
        socket.emit("count", secondsSinceConnection++);
    }, 1000);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(interval);
        userCount--;
        io.emit("user left", userCount);
    });
});

server.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});