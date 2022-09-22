import Sockets from "./model/Sockets.js";

const names = ["receive", "loc01", "loc02", "loc03", "loc04", "chat"];
const socketMap = {};
names.forEach((name, idx) => {
  socketMap[name] = new Sockets(name, 3000 + idx);
  socketMap[name].setupSocket();
});

const btn1 = document.querySelector("#btn1");
const btn2 = document.querySelector("#btn2");
const btn3 = document.querySelector("#btn3");
const btn4 = document.querySelector("#btn4");
const btn5 = document.querySelector("#btn5");
const btn6 = document.querySelector("#btn6");

console.log(socketMap);

const handleSendServer = (e) => {
  const num = e.target.dataset.num;
  const data = {
    name: "kimson",
    age: 25,
    gender: 1,
  };

  const jsonData = JSON.stringify(data);
  const binaryData = jsonData
    .split("")
    .map((json) => json.charCodeAt(0).toString(2));
  const encoder = new TextEncoder();
  const encodedBinaryData = encoder.encode(binaryData);
  console.log(encodedBinaryData);
  console.log(socketMap[names[num - 1]]);
  const socketname = names[num - 1];
  socketMap[socketname][socketname].send(encodedBinaryData);
};

[btn1, btn2, btn3, btn4, btn5, btn6].forEach((bn) => {
  bn.addEventListener("click", handleSendServer);
});
