const socket = new WebSocket("ws://localhost:8081");

const pending = [];

socket.addEventListener("open", () => {
  while (pending.length) {
    const { address, args } = pending.shift();
    socket.send(JSON.stringify({ address, args }));
  }
});

export function sendPd(address, ...args) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ address, args }));
    return;
  }

  // Queue messages until socket opens
  pending.push({ address, args });
}

export default { sendPd };
