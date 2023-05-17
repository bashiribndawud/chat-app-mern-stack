import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./src/routers/auth.js";
import cookieParser from "cookie-parser";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import userModel from "./src/models/User.js";
import MessageModel from "./src/models/Message.js";
const app = express();

const PORT = process.env.PORT || 9000;
const USERNAME = process.env.MONGO_USERNAME;
const PASSWORD = process.env.MONGO_PASSWORD;
const jwtSecret = process.env.SECRET;
mongoose
  .connect(
    `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.s0twnmf.mongodb.net/?retryWrites=true&w=majority`,
    { retryWrites: true, w: "majority" }
  )
  .then(() => {
    console.log("Connected to database");
    startServer();
  })
  .catch((error) => {
    console.log(error);
  });

const startServer = () => {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.disable("x-powered-by");
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
  );

  const server = app.use("/auth", authRouter);
  app.listen(PORT, () => {
    console.log(`Server runnning at port: ${PORT}`);
  });

  // WebsocketServer
  //app -> is an event handle which handles all resquest to the server
  const httpServer = http.createServer(app);
  httpServer.listen(4040);
  // It associates the WebSocket server with the underlying HTTP server.
  const wss = new WebSocketServer({
    server: httpServer,
  });

  wss.on("connection", (connection, req) => {
    const { cookie } = req.headers;
    if (cookie) {
      const tokenCookieString = cookie
        .split(";")
        .find((str) => str.startsWith("token="));
      const token = tokenCookieString?.split("=")[1];
      if (token) {
        const { id, username } = jwt.verify(token, jwtSecret);
        connection.id = id;
        connection.username = username;
      }
    }
    // Broadcast the list of online clients to all connected clients
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.id,
            username: c.username,
          })),
        })
      );
    });
    //event listenning for message sent from connected client
    connection.on("message", async(message) => {
      const messageData = JSON.parse(message.toString())
      const {text, recipient} = messageData
      // console.log(messageData)
      if(text && recipient){
        let newMessage = await MessageModel.create({
          sender: connection.id,
          recipient,
          text
        });
        //assume user is connected from mutiple device
        [...wss.clients]
          .filter((client) => client.id === recipient)
          .map((c) => c.send(JSON.stringify({ text, sender: connection.id, id: newMessage._id, recipient })));
      }
    })
  });

};
