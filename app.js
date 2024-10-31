// Import: express, http, socket.io, chess.js
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

// Create Express app instance
const app = express();

// Initialize HTTP server with Express
const server = http.createServer(app);

// Instantiate Socket.io on HTTP server
const io = socket(server);

// Create Chess object instance (chess.js)
const chess = new Chess();

// Initialize:
// - Players object: track socket IDs, roles (white/black)
// - CurrentPlayer: track current turn
let players = {};
let currentPlayer = "W";

// Use EJS templating engine
app.set("view engine", "ejs");

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Define route for root URL
app.get("/", (req, res) => {
  // Render index.ejs template with title "ChessGame using Socket.io"
  res.render("index", { title: "ChessGame using Socket.io" });
});

server.listen(3000, function () {
  console.log("Server listening on port 3000");
});

// Socket.io handles connection event
io.on("connection", function (socket) {
  console.log("New user connected");
});
