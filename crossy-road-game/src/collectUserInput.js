import { queueMove } from "./components/Player";
import { sendPd } from "./pdRelay";

const keyMap = {
  w: "forward",
  s: "backward",
  a: "left",
  d: "right",
};

window.addEventListener("keydown", (event) => {
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  queueMove(direction);
  sendPd("hop");
});
