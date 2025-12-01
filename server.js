const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  let filePath = "." + (req.url === "/" ? "/index.html" : req.url);
  const ext = path.extname(filePath);

  let type = "text/html";
  if (ext === ".css") type = "text/css";
  if (ext === ".js") type = "text/javascript";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });
let clients = [];

wss.on("connection", (ws) => {
  if (clients.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  clients.push(ws);

  ws.on("message", (msg) => {
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
