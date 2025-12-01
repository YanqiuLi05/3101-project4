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
  if (ext === ".png") type = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") type = "image/jpeg";

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
  console.log("A user connected");
  ws.binaryType = "text";

  clients.push(ws);

  ws.on("message", (msg) => {
    const text = msg.toString(); 
    console.log("MESSAGE RECEIVED:", text);
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(text); 
      }
    });
  });

  ws.on("close", () => {
    console.log("A user disconnected");
    clients = clients.filter((c) => c !== ws);
  });
});
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
