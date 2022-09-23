const uWS = require("./socket/uws.js");
const port = 8080;
const Queue = require("./queue/queue.js");
const Queue2 = require("./queue/queue2.js");
const Queue3 = require("./queue/queue3.js");
const sockets = new Map();
const viewers = new Map();
const players = new Map();
const locationQueue = new Queue3();
const chatQueue = new Queue2();
const stateQueue = new Queue2();
const chatLog = new Queue();
const decoder = new TextDecoder();
var deviceID = 0;

// ---------- protobuf js ------------
const protobuf = require("protobufjs");
var Type = protobuf.Type,
  Field = protobuf.Field;
function ProtoBuf(properties) {
  protobuf.Message.call(this, properties);
}
(ProtoBuf.prototype = Object.create(protobuf.Message)).constructor = ProtoBuf;

//Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id")
//Field.d(2, "bytes", "required")(ProtoBuf.prototype, "pos")
//Field.d(3, "sfixed32", "required")(ProtoBuf.prototype, "angle")
Field.d(1, "fixed32", "required")(ProtoBuf.prototype, "id");
Field.d(2, "float", "required")(ProtoBuf.prototype, "pox");
Field.d(3, "float", "required")(ProtoBuf.prototype, "poy");
Field.d(4, "float", "required")(ProtoBuf.prototype, "poz");
Field.d(5, "sfixed32", "required")(ProtoBuf.prototype, "roy");
/*
for(let i = 0; i < 5000; i++) {
    locationQueue.enter(`{"id":"tewtewt","pox":${i},"poy":${2.213124515},"poz":${1223.241421123123},"rox":${i},"roy":${2.213124515},"roz":${1223.241421123123}}`)
}
*/

var uint8array, messageString, messageObject, locationTmp;

var newArray = [];

const app = uWS
  .App()
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    //maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 1800,
    //maxBackpressure: 1024,

    open: (ws) => {
      deviceID++;
      ws.subscribe(String(deviceID));
      ws.subscribe("server");
      sockets.set(ws, deviceID);
    },
    message: (ws, message, isBinary) => {
      console.log(decoder.decode(new Uint8Array(message)));
      newArray.push(message);
      if (isBinary) {
        players.delete(sockets.get(ws));
        locationQueue.enter(message);
        locationTmp = ProtoBuf.decode(new Uint8Array(message));
        if (players.has(locationTmp.id)) {
          Object.assign(players.get(locationTmp.id), {
            pox: locationTmp.pox,
            poy: locationTmp.poy,
            poz: locationTmp.poz,
            //rox: messageObject.rox,
            roy: locationTmp.roy,
            //roz: messageObject.roz,
            //row: messageObject.row,
          });
        }
      } else {
        messageString = decoder.decode(new Uint8Array(message));
        messageObject = JSON.parse(messageString);
        console.log(messageObject.device);
        messageHandler(messageString, messageObject, ws, isBinary);
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      if (viewers.has(sockets.get(ws))) viewers.delete(sockets.get(ws));

      if (players.has(sockets.get(ws))) {
        players.delete(sockets.get(ws));
        app.publish("server", JSON.stringify(Object.fromEntries(players)));
      }

      console.log(sockets.get(ws) + " exited!");
      sockets.delete(ws);
      console.log(
        "current connect players: " +
          players.size +
          " / current connect viewers: " +
          viewers.size +
          "배열길이" +
          newArray.length
      );
    },
  })
  .any("/*", (res, req) => {
    res.end("Nothing to see here!");
  })
  .listen(port, (token) => {
    if (token) {
      console.log("Listening to port " + port);
    } else {
      console.log("Failed to listen to port " + port);
    }
  });

function messageHandler(messageString, messageObject, ws, isBinary) {
  if (messageObject.device === "mobile") {
    app.publish("server", JSON.stringify(messageObject));
  }
  if (messageObject.type === "viewer") {
    // deviceID++;
    // ws.subscribe(String(deviceID));
    // ws.subscribe("server");
    // sockets.set(ws, deviceID);
    viewers.set(
      sockets.get(ws),
      Object.assign(messageObject, { deviceID: sockets.get(ws) })
    );

    //clients.get(deviceID).send(JSON.stringify(new Array(players.get(deviceID))), isBinary)
    app.publish(
      String(sockets.get(ws)),
      JSON.stringify(new Array(viewers.get(sockets.get(ws))))
    );
    if (players.size > 0) deviceID++;
    ws.subscribe(String(deviceID));
    ws.subscribe("server");
    sockets.set(ws, deviceID);
    app.publish("server", JSON.stringify(Object.fromEntries(players)));

    // console.log("deviceID: " + messageObject.deviceID + " has joined!");
    // console.log(
    //   "current connect players: " +
    //     players.size +
    //     " / current connect viewers: " +
    //     viewers.size
    // );
  } else if (messageObject.type === "player") {
    players.set(
      sockets.get(ws),
      Object.assign(messageObject, { deviceID: sockets.get(ws) })
    );
    viewers.delete(sockets.get(ws));
    ws.unsubscribe(String(sockets.get(ws)));

    app.publish("server", JSON.stringify(Object.fromEntries(players)));
    // console.log(
    //   "deviceID: " +
    //     messageObject.deviceID +
    //     " has logined! to " +
    //     messageObject.id +
    //     "!!"
    // );
    // console.log(
    //   "current connect players: " +
    //     players.size +
    //     " / current connect viewers: " +
    //     viewers.size
    // );
  } else if (messageObject.type === "chat") {
    chatQueue.enter(messageString);
  } else if (messageObject.type === 4) {
    stateQueue.enter(messageString);
    Object.assign(players.get(messageObject.deviceID), messageObject);
  }
}

const sendLocation = setInterval(() => {
  if (locationQueue.count !== 0) {
    app.publish("server", locationQueue.get(), true, true);
  }
}, 8);

const sendChat = setInterval(() => {
  if (chatQueue.count !== 0) {
    app.publish("server", chatQueue.get());
  }
}, 100);

/*
setTimeout(() => 
    const sendChat = setInterval(() => {
        app.publish('server', chatQueue.get())
    }, 16)
}, 10)

setTimeout(() => {
    const sendState = setInterval(() => {
        app.publish('server', stateQueue.get())
    }, 16)
}, 14)
*/

//ping
setInterval(() => {
  app.publish("server", "");
}, 55000);