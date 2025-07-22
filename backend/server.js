import express from "express";
import DBconfig from "./config/DBconfig.js";
import cors from 'cors'
import route from "./routes/Auth.js";
import mall from "./routes/Mall.js";
import cookieParser from "cookie-parser";
import foodcart from "./routes/foodcart.js";
const app = express();
import dotenv from 'dotenv'
import { Server } from "socket.io";
import http from "http";

dotenv.config()

app.use(express.json())

const server = http.createServer(app);

app.use(cors())
app.use(cookieParser())


// socket config 

const io = new Server(server,{
    cors:{
        origin:'*',
        methods: ['GET', 'POST']
    }
})


// make a map of all users connected to the socket
const connectedUsers = new Map();


io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered`);
  });

  socket.on('disconnect', () => {
    for (let [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});


app.use((req,res,next)=>{
    req.io = io;
    req.connectedUsers = connectedUsers;
    next();
})


// this is for the user to register and get verified ----- > 
app.use("/user",route)

// Now lets move on for users dashboards an all ----- > 
app.use("/mall",mall)

// for the food cart workers their perspective apis are here in this route ----> 
app.use("/foodcart",foodcart)
app.get("/",(req,res)=>{
    res.send("hii")
})
// Server start point and DB setup -----> `
app.listen(process.env.PORT,async(req,res)=>{
     await DBconfig()
     console.log("Server started .. ");
})

