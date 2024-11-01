// Socket.io Initialization
const socket = io();

// socket.emit("request to backend");
// socket.on("respond from backend", function() {
//     // console.log("respond received");
// });

// Chess Game Initialization
const chess = new Chess();

// DOM elements
const boardElement = document.querySelector(".chessboard");

// Variables
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Function to render the board
const renderBoard = () => {
  const board = chess.board();
  // console.log( board );

  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    // console.log( row , rowIndex );
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");

      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.column = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode( square );

        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = {
              row: rowIndex,
              column: squareIndex,
            };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(e.target.dataset.row),
            column: parseInt(e.target.dataset.column),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b') {
    boardElement.classList.add("flipped");
  }
  else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.column)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.column)}${8 - target.row}`,
        promotion: "q",
    };
    socket.emit("move", move);
};

const getPieceUnicode = ( piece ) => {
    const unicodePieces = {
        k: '♔',
        q: '♕',
        r: '♖',
        b: '♗',
        n: '♘',
        p: '♙',
        K: '♔',
        Q: '♕',
        R: '♖',
        B: '♗',
        N: '♘',
        P: '♙'
    };

    return unicodePieces[piece.type] || "";
};

renderBoard();

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});
