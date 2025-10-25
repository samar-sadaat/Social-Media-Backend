const express = require('express');
const exp = express();
const cors = require('cors');
const UserRoute = require('./src/routes/userRoutes');
const PostRoute = require('./src/routes/postRoutes');
const CommentRoute = require('./src/routes/commentRoutes');
const ReplyRoute = require('./src/routes/replyRoutes');
const ConnectionRoute = require('./src/routes/connectionRoutes')

const mongodb = require('./db');

require('dotenv').config();

// const bulkRoute = require('./bulkOpreation/bulkOpreation');

// const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
mongodb();

// socket
const server = http.createServer(exp);
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:5173",
        method: ["Get", "Post", "Put", "Delete"]
    }
});


io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When frontend emits 'registerUser', join that user's room
    socket.on("registerUser", (userId) => {
        socket.join(userId.toString());
        socket.userId = userId;
        console.log(`User ${userId} login`);
    });

    // handle clean up on disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId || socket.id}`);
    });
});
exp.set('io', io);

// exp.use("/uploads", express.static(path.join(__dirname, "uploads")));

exp.use(cors({
    // origin: ["https://school-lms-git-main-samar-sadaats-projects.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

exp.get("/", (req, res) => {
  res.send("Backend is live and CORS configured properly!");
});

exp.use(express.json());
exp.use('/user', UserRoute);
exp.use('/post', PostRoute);
exp.use('/comment', CommentRoute);
exp.use('/reply', ReplyRoute);
exp.use('/connection', ConnectionRoute);

// exp.use('/bulk', bulkRoute);


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is Runing ${PORT}`)
})