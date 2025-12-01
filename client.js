console.log("client.js running");


const ws = new WebSocket("ws://localhost:3000");


ws.onopen = () => console.log("WS connected!");
ws.onerror = (e) => console.log("WS error:", e);
ws.onclose = () => console.log("WS closed");

const canvas = document.getElementById("pad");
const ctx = canvas.getContext("2d");
const notepadImg = document.getElementById("notepad-img");

let color = "#4A4122";
let drawing = false;
let lastX = 0;
let lastY = 0;
const dotSize = 6;
const dotSpacing = 5;


notepadImg.onload = () => {
  canvas.width = notepadImg.clientWidth;
  canvas.height = notepadImg.clientHeight;
};
if (notepadImg.complete) {
  canvas.width = notepadImg.clientWidth;
  canvas.height = notepadImg.clientHeight;
}

// Color selection
document.querySelectorAll(".color").forEach(c => {
  c.addEventListener("click", () => {
    color = c.dataset.color;
  });
});

function insideNotepad(x, y) {
  return x >= 0 && y >= 0 && x <= canvas.width && y <= canvas.height;
}

function drawDot(x, y, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, dotSize, 0, Math.PI * 2);
  ctx.fill();
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  drawing = true;

  if (insideNotepad(lastX, lastY)) {
    drawDot(lastX, lastY, color);

    ws.send(JSON.stringify({
      type: "dot",
      x: lastX,
      y: lastY,
      color
    }));
  }
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (!insideNotepad(x, y)) return;

  const dx = x - lastX;
  const dy = y - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance >= dotSpacing) {
    const steps = Math.floor(distance / dotSpacing);

    for (let i = 1; i <= steps; i++) {
      const dotX = lastX + (dx / steps) * i;
      const dotY = lastY + (dy / steps) * i;

      drawDot(dotX, dotY, color);

      ws.send(JSON.stringify({
        type: "dot",
        x: dotX,
        y: dotY,
        color
      }));
    }

    lastX = x;
    lastY = y;
  }
});


ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "dot") {
    drawDot(msg.x, msg.y, msg.color);
  }
};
