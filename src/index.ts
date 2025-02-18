import debug from "debug";
import express from "express";
import http from "http";
import socketIO from "socket.io";

const serverDebug = debug("server");
const ioDebug = debug("io");
const socketDebug = debug("socket");
var rateLimit = require('ws-rate-limit')(100, '10s')

require("dotenv").config(
  process.env.NODE_ENV !== "development"
    ? { path: ".env.production" }
    : { path: ".env.development" },
);


function monitorFun() {
  const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

  const memoryData = process.memoryUsage();

  const memoryUsage = {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };

  console.log(memoryUsage);
}
setInterval(monitorFun, 2000);

const app = express();
const port = process.env.PORT || 80; // default port to listen

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Excalidraw collaboration server is up :)");
});

const server = http.createServer(app);

server.listen(port, () => {
  serverDebug(`listening on port: ${port}`);
});

const io = socketIO(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin":
        (req.header && req.header.origin) || "https://excalidraw.com",
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
  perMessageDeflate: false,
});

io.on("connection", (socket) => {
  ioDebug("connection established!");
  rateLimit(socket);
  io.to(`${socket.id}`).emit("init-room");
  socket.on("join-room", (roomID) => {
    socketDebug(`${socket.id} has joined ${roomID}`);
    socket.join(roomID);
    if (io.sockets.adapter.rooms[roomID].length <= 1) {
      io.to(`${socket.id}`).emit("first-in-room");
    } else {
      socket.broadcast.to(roomID).emit("new-user", socket.id);
    }
    io.in(roomID).emit(
      "room-user-change",
      Object.keys(io.sockets.adapter.rooms[roomID].sockets),
    );
  });

  socket.on(
    "server-broadcast",
    (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
      socketDebug(`${socket.id} sends update to ${roomID}`);
      socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
    },
  );

  socket.on(
    "server-volatile-broadcast",
    (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
      socketDebug(`${socket.id} sends volatile update to ${roomID}`);
      socket.volatile.broadcast
        .to(roomID)
        .emit("client-broadcast", encryptedData, iv);
    },
  );

  socket.on("disconnecting", () => {
    const rooms = io.sockets.adapter.rooms;
    for (const roomID in socket.rooms) {
      const clients = Object.keys(rooms[roomID].sockets).filter(
        (id) => id !== socket.id,
      );
      if (clients.length > 0) {
        socket.broadcast.to(roomID).emit("room-user-change", clients);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.removeAllListeners();
  });
});
