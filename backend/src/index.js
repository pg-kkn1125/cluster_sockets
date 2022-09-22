const uWs = require("uWebSockets.js");
let isDisableKeepAlive = false;
const cluster = require("cluster");
const status = process.env.NODE_ENV !== "production";

const options = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: uWs.DEDICATED_COMPRESSOR_3KB,
};

const pmid = process.env.pm_id;

const convertResponseData = (data, isBinary) => {
  if (isBinary) {
    const decoder = new TextDecoder();
    const decodedText = decoder.decode(data);
    const parsedData = decodedText
      .split(",")
      .map((bi) => String.fromCharCode(parseInt(Number(bi), 2)))
      .join("");
    return parsedData;
  }
  return data;
};

process.send("ready");

if (cluster.isMaster) {
  let instance = 0;
  cluster.on("test", (stream) => {
    console.log(stream);
  });
  while (instance < cpuCores) {
    cluster.fork();
    ++instance;
  }
} else {
  console.log(`Child-process ${process.pid} started`);
}

uWs
  .App({})
  .ws(`/uws/*`, {
    ...options,
    open: (ws, req) => {
      if (isDisableKeepAlive) {
        res.set("Connection", "close");
      }

      console.log("open success");
      ws.send("start");
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
    },
    message: (ws, message, isBinary) => {
      const data = convertResponseData(message, isBinary);
      console.log(data);
      const emit = new cluster.Worker.EventEmitter(); // 이게 핵심으로 보임
      if (data == 0) {
        emit.emit("test", "koko");
      }
      ws.send(pmid, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
  })
  .get("/uws/*", (res, req) => {
    switch (pmid) {
      case 0:
        console.log(1);
        break;
      case 1:
        console.log(2);
        break;
      case 2:
        console.log(3);
        break;
      case 3:
        console.log(4);
        break;
      case 4:
        console.log(5);
        break;
      case 5:
        console.log(6);
        break;
      default:
        console.log(6);
        break;
    }
    res.writeStatus(200).writeHEader("test", "yes").end("Hello there!");
  })
  .listen(3000, (socket) => {
    if (socket) {
      // pm2 send a text as "ready" sign when pm2 reload
      console.log(`server listening on ws://localhost:${3000}`);
    }
  });

process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  console.log("test sigint");

  app.close(function () {
    console.log("server closed");
    process.exit(0);
  });
});
