// cut line
console.log(`=========================================================`);
const uWs = require("uWebSockets.js");
const cluster = require("cluster");
const http = require("http");
const os = require("os");

const { convertResponseData } = require("./util/tools");
const { options } = require("./util/globalVariables");

const numCPUs = os.cpus().length;

const clusterList = new Map();
const clusterNames = [
  "receive",
  "loc01",
  "loc02",
  "loc03",
  "loc04",
  "loc05",
  "loc06",
  "loc07",
  "loc08",
  "loc09",
  "chat",
];

const ClusterTuple = new (function ClusterTuple(names) {
  for (let i = 0; i < names.length; i++) {
    this[(this[i] = names[i])] = i;
  }
})(clusterNames);

// 개발/배포 환경 여부
const status = process.env.NODE_ENV !== "production";
// keep alive 상태 설정
let isDisableKeepAlive = false;
// 프로세스 식별 ID
const procId = process.env.NODE_APP_INSTANCE;
const socketMap = new Map();

const handlers = {
  ...options,
  open: (ws) => {
    if (isDisableKeepAlive) {
      // res.set("Connection", "close");
    }
    // 소켓 저장
    ws.subscribe(String(procId));
    ws.subscribe("server");
    socketMap.set(procId, ws);

    console.log("open success");
    ws.send("start");
  },
  close: (ws, code, message) => {
    if (isDisableKeepAlive) {
      ws.unsubscribe(String(procId));
    }
  },
  message: (ws, message, isBinary) => {
    const data = convertResponseData(message, isBinary);
    if (typeof data === "string") {
      const json = JSON.parse(data);
      messageHandler(ws, json, isBinary);
    } else {
      process.send("data type error");
    }
  },
  drain: (ws) => {
    console.log("WebSocket backpressure: ", ws.getBufferedAmount());
  },
};

const app = uWs
  .App({})
  .ws("/uws/receive", { ...handlers })
  .ws("/uws/loc01", { ...handlers })
  .ws("/uws/loc02", { ...handlers })
  .ws("/uws/loc03", { ...handlers })
  .ws("/uws/loc04", { ...handlers })
  .ws("/uws/chat", { ...handlers })
  .get(`/*`, (res, req) => {
    res.end("test");
  })
  .listen(3000, (socket) => {
    if (socket) {
      process.send("ready");
      console.log(`server listening on ws://localhost:${3000}`);
    }
  });

if (cluster.isPrimary) {
  // Master:
  // Let's fork as many workers as you have CPU cores
  // console.log("cpu count: ", numCPUs);
  let timeout;
  for (var i = 1; i < numCPUs; ++i) {
    // 스레드 추가
    clusterList.set(ClusterTuple[i], cluster.fork());
    //
    clusterList.get(ClusterTuple[i]).on("listening", (address) => {
      worker.send("shutdown");
      worker.disconnect();
      timeout = setTimeout(() => {
        worker.kill();
      }, 2000);
    });

    clusterList.get(ClusterTuple[i]).on("disconnect", () => {
      clearTimeout(timeout);
    });

    console.log("fork");
    // console.log(
    //   `worker connect ${i}`,
    //   clusterList.get(ClusterTuple[i]).isConnected()
    // );
    clusterList.get(ClusterTuple[i]).on("message", (message) => {
      if (typeof message === "string") {
        console.log(message);
        console.log(`process id ${i} said : ${message}`);
      } else if (typeof message === "object" && message.type === "proc") {
        console.log(message);
        console.log(`process id ${i} said : ${JSON.stringify(message)}`);
      }
    });
  }
} else {
  console.log("worker", process.pid);
  process.send({ type: "proc", name: "server", msg: "제가 처리하겠습니다." });
}

const messageHandler = (ws, data, isBinary) => {
  // process.send("xptmxm");
  console.log(typeof data);
  process.send({
    type: "proc",
    name: "server",
    msg: `${data.name} 프로세스의 응답`,
  });
  // clusterList[ClusterTuple[data.name]].send(`${data.name} 프로세스의 응답`);
  ws.send(String(data.name), data);
};

process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  app.close(function () {
    process.exit(0);
  });
});

// // ping
// setInterval(() => {
//   if (socketMap.get(1)) {
//     socketMap.get(1).send("test ping");
//   }
// }, 1000);
