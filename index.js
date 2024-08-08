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
    useNewUrlParser: true,
    useUnifiedTopology: true,
}). then(() => {
    console.log('connected to mongodb');
}).catch((err) => {
    console.log(err.message);
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