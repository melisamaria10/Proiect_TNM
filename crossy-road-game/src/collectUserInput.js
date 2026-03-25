import { queueMove } from "./components/Player";

window.addEventListener("keydown", (event) => {
  if (event.key === 'w') {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("forward");
  } else if (event.key === 's') {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("backward");
  } else if (event.key === 'a') {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("left");
  } else if (event.key === 'd') {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("right");
  }
});