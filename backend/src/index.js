const uWs = require("uWebSockets.js");
let isDisableKeepAlive = false;
const status = process.env.NODE_ENV !== "production";

const options = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: uWs.DEDICATED_COMPRESSOR_3KB,
};

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
      ws.send(data, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: ", ws.getBufferedAmount());
    },
  })
  .get("/uws/receive", (res, req) => {
    console.log(res, "receive");
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
