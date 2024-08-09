const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');  
const userRoutes = require('./routes/userRoutes');
const messageRoute = require('./routes/messagesRoute');  
const app = express();
const socket = require('socket.io');

require('dotenv').config();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true,
};
app.use(cors(corsOptions));


app.use(cors(corsOptions));


app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoute);

mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000,  // Timeout for at finde MongoDB server
  socketTimeoutMS: 45000,  // Timeout for socket
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
});


mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});


const server = app.listen(process.env.PORT, () => {
    console.log('server is running on port', process.env.PORT);
});

const io = socket(server, {
  cors: {
      origin: process.env.FRONTEND_URL || '*', 
      credentials: true,
  },
});


global.onlineUsers = new Map();

//socket.io connection handler
io.on("connection", (socket) => {
  global.chatSocket = socket;
  
  //when user is added
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);

  });

  //when message is sent
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});