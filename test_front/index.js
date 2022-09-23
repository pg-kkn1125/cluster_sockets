import socketpkg, { names } from "./model/socketPkg.js";

const btn1 = document.querySelector("#btn1");
const btn2 = document.querySelector("#btn2");
const btn3 = document.querySelector("#btn3");
const btn4 = document.querySelector("#btn4");
const btn5 = document.querySelector("#btn5");
const btn6 = document.querySelector("#btn6");

const encodeData = (data) => {
  const jsonData = JSON.stringify(data);
  const binaryData = jsonData
    .split("")
    .map((json) => json.charCodeAt(0).toString(2));
  const encoder = new TextEncoder();
  return encoder.encode(binaryData);
};

const handleSendServer = (e) => {
  const num = e.target.dataset.num;
  const data = {
    name: "kimson",
    age: 25,
    gender: 1,
  };
  const encodedBinaryData = encodeData(data);
  const socketname = names[num];
  socketpkg[socketname][socketname].send(encodedBinaryData);
};

[btn1, btn2, btn3, btn4, btn5, btn6]
  .filter((_) => _)
  .forEach((bn) => {
    bn.addEventListener("click", handleSendServer);
  });
