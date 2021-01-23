const path = require('path');
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

// heroku sets NODE_ENV to "production" by default, 
// so this kicks in when deployed there
if (process.env.NODE_ENV === "production") {
    // make heroku redirect from http to https
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else{
            next();
        }
    });
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'))
    });
    app.enable('trust proxy');
} else {
    app.get('/', (req, res) => {
        res.send("yo");
    });
}

server.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});