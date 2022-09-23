import Sockets from "./Sockets.js";

export const names = [
  "receive",
  "loc01",
  "loc02",
  "loc03",
  "loc04",
  "",
  "",
  "",
  "",
  "",
  "",
  "chat",
];
const socketMap = {};
names.forEach((name, idx) => {
  socketMap[name] = new Sockets(name, 3000);
  console.log(socketMap[name]);
  socketMap[name].setupSocket();
});

export default socketMap;
