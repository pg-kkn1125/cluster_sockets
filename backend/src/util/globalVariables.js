const uWs = require("uWebSockets.js");

const options = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: uWs.DEDICATED_COMPRESSOR_3KB,
};

module.exports = { options };
