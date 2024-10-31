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
    if( !players.white ) {
        // console.log(socket.id)
        players.white = socket.id;
        socket.emit();
    }
    else if( !players.black ) {
        players.black = socket.id;
        socket.emit();
    }
    else {
        socket.emit("Role: Spectator");
    }

    // Client disconnection:
    // - Remove assigned role from players object
    socket.on("disconnect", function() {
        if(players.white === socket.id) {
            delete players.white;
        }
        else if(players.black === socket.id) {
            delete players.black;
        }
    });
});
