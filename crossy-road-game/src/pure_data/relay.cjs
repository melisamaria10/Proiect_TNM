const WebSocket = require("ws");
const osc = require("osc");

const udpPort = new osc.UDPPort({
  remoteAddress: "127.0.0.1",
  remotePort: 9000,
  localAddress: "127.0.0.1",
  localPort: 0
});

udpPort.on("error", (err) => console.error("UDP error:", err));
udpPort.open();

const RELAY_PORT = process.env.PD_RELAY_PORT ? Number(process.env.PD_RELAY_PORT) : 8081;
const wss = new WebSocket.Server({ port: RELAY_PORT });

wss.on("connection", (ws) => {
  console.log("Game connected");
  ws.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    console.log("→ Pd:", msg.address);
    udpPort.send({ address: "/" + msg.address, args: msg.args || [] });
  });
});

wss.on("listening", () => {
  console.log(`Relay running: browser:${RELAY_PORT} → Pd:9000`);
});

wss.on("error", (err) => console.error("WebSocket error:", err));
