//@ts-check
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import ShareDB from "sharedb";
import richText from "rich-text";
import http from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

/**
 * @type {{[key: string]: WebSocket}}
 */
const connections = {};

ShareDB.types.register(richText.type);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Create shared Db Server
const shareDbServer = new ShareDB();

wss.on("connection", (webSocket) => {
  // console.log("New connection", webSocket.);
  const uuid = uuidv4();
  webSocket["uuid"] = uuid;

  connections[uuid] = webSocket;

  // var stream = new WebSocketJSONStream(webSocket);
  // shareDbServer.listen(stream);

  // webSocket.on("close", () => {
  //   delete connections[webSocket["uuid"]];
  //   broadcast(
  //     connections,
  //     uuid,
  //     JSON.stringify({
  //       type: "connection-disconnected",
  //       source: 'custom',
  //       data: Object.keys(connections),
  //     })
  //   );
  // });

  // webSocket.on("error", (err) => {
  //   console.log("error", err);
  // });

  // webSocket.on("message", (data) => {
  //   const message = JSON.parse(data.toString());
  //   switch (message.type) {
  //     case "selection-change":
  //       selectionChangeHandler(message, uuid);
  //       break;
  //     default:
  //       break;
  //   }
  // });

  // emitAll(
  //   connections,
  //   uuid,
  //   JSON.stringify({
  //     type: "connection-added",
  //     source: 'custom',
  //     data: {
  //       id: uuid,
  //     },
  //   })
  // );

  console.log("connections", Object.keys(connections).length);
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

/**
 *
 * @param {{[key:string]: WebSocket}} connections
 * @param {string} currentConnectionId
 * @param {*} data
 */
function broadcast(connections, currentConnectionId, data) {
  const connectionKeys = Object.keys(connections).filter(
    (key) => key !== currentConnectionId
  );
  const sockets = connectionKeys.map((key) => connections[key]);

  sockets.forEach((socket) => {
    socket.send(data);
  });
}

/**
 *
 * @param {{[key:string]: WebSocket}} connections
 * @param {string} currentConnectionId
 * @param {*} data
 */
function emitAll(connections, currentConnectionId, data) {
  const connectionKeys = Object.keys(connections);
  const sockets = connectionKeys.map((key) => connections[key]);

  sockets.forEach((socket) => {
    socket.send(data);
  });
}

function selectionChangeHandler(message, uuid) {
  const id = message.data.id;
  const selection = message.data.selection;
  broadcast(
    connections,
    uuid,
    JSON.stringify({
      type: "selection-change-update",
      data: {
        id,
        selection,
      },
    })
  );
}
