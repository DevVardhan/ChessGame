const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { log } = require("console");
const res = require("express/lib/response");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess()
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game " });
})
let i = 1;

io.on("connection", (uniqueSocket) => {
    console.log("connected users : " + i++)
    if (!players.white) {
        // checks and create field on players class
        players.white = uniqueSocket.id;
        // no functionality just for showing it personally to player
        uniqueSocket.emit("playerRole", "w");
    }
    else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "b");
    }
    else {
        uniqueSocket.emit("spectatorRole")
    }
    uniqueSocket.on("disconnect", () => {
        if (uniqueSocket.id == players.white || uniqueSocket.id == players.black) {
            delete players.white;
            delete players.black;
        }
        console.log("disconnected");
        --i;
    })

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() == "w" && uniqueSocket.id != players.white) return;
            if (chess.turn() == "b" && uniqueSocket.id != players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            } else {
                console.log("worng move : ", move)
                uniqueSocket.emit("invalid move :", move)
            }
        }
        catch (err) {
            console.log(err);
            uniqueSocket.emit("invalide move :", move);
        }
    })
})


server.listen(3000, function () {
    console.log("Listening at locolhost:3000");
});