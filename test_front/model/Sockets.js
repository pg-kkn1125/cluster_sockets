const board = document.querySelector("#board");
const box = document.querySelector(".box");

class Sockets {
  constructor(name, port) {
    this.socketname = name;
    this[name] = new WebSocket(`ws://localhost:${port}/uws/${name}`);
  }
  onopen = (e) => {
    console.log(e);
    box.classList.add("active");
  };
  onmessage = (e) => {
    if (e.data instanceof Blob) {
      const reader = new FileReader();
      reader.readAsBinaryString(e.data);
      reader.onload = () => {
        // 해석된 데이터 받음
        console.log(reader.result);
        board.innerHTML = reader.result;
      };
    } else {
      board.innerHTML = e.data;
    }
  };
  onclose = (e) => {
    console.log(e);
  };
  onerror = (e) => {
    console.log(e);
    box.classList.remove("active");
  };
  setupSocket() {
    const name = this.socketname;
    this[name].onopen = this.onopen;
    this[name].onmessage = this.onmessage;
    this[name].onclose = this.onclose;
    this[name].onerror = this.onerror;
  }
}

export default Sockets;
