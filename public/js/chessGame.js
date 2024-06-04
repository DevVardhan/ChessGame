
const socket = io();
const chess = new Chess()
const boardElement = document.querySelector(".chessboard")

let dragPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    // Assuming 'board' is defined elsewhere with the chess board representation
    chess.boardElement = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.colour === "w" ? ".white" : ".black");
                pieceElement.innerText = getPieceUnicode(square); // Can be filled with piece symbol 
                pieceElement.draggable = playerRole === square.colour;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        dragPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", ""); // Clear data transfer
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    dragPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (dragPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        });
    });

    if (role == "b") {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)} $(8 - sourceSquare.row)`,
        to: `${String.fromCharCode(97 + target.col)} $(8 - targetSource.row)`,
        promotion: 'q'
    }
    socket.emit("move", target);

};

const getPieceUnicode = () => {
    const unicodePieces = {
        K: "♔",
        Q: "♕",
        E: "♖",
        B: "♗",
        N: "♘",
        P: "♙",
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "♟",
    };
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role) {
    playerRole = role;
    renderBoard();
});
socket.on("spectatorRole", function (role) {
    playerRole = null;
    renderBoard();
});
socket.on("boardState", function (role) {
    chess.load(fen);
    renderBoard();
});
socket.on("move", function (move) {
    chess.move(move);
    renderBoard();
});


renderBoard();