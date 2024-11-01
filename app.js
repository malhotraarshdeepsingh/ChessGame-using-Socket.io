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
let currentPlayer = "w";

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
  // console.log("New user connected");
  // console.log(socket);

  //   socket.on("request to backend", function () {
  //     // console.log("event received");
  //     io.emit("respond from backend");
  //   });

  // socket.on("disconnect", function () {
  //     console.log("socket disconnected");
  // })

  // Server assigns role based on availability:
  // - If slots empty:
  // - Assign role (white/black)
  // - Inform player
  // - If slots full:
  // - Designate as spectator
  if (!players.white) {
    // console.log(socket.id)
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  // Client disconnection:
  // - Remove assigned role from players object
  socket.on("disconnect", function () {
    if (players.white === socket.id) {
      delete players.white;
    } else if (players.black === socket.id) {
      delete players.black;
    }
  });

  // Listen for "move" events:
  // - Validate correct player's turn
  // - If valid:
  //     - Update game state
  //     - Broadcast move via "move" event
  //     - Send updated board state via "boardState" event
  // - If invalid:
  //     - Log error message
  socket.on("move", function (move) {
    try {
      if (
        (chess.turn() === "w" && socket.id !== players.white) ||
        (chess.turn() === "b" && socket.id !== players.black)
      ) {
        return; // Ignore if it's not the player's turn
      }

      const result = chess.move(move);
      if (result) {
        currentPlayer=chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        socket.emit("invalidMove", move);
      }
    } catch (error) {
      console.log(error);
      socket.emit("invalidMove");
    }
  });
});
