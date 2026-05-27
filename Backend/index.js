const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const textRoutes = require("./routes/textRoutes");
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const matchRoutes = require("./routes/matchRoutes");
const { registerEvents } = require("./sockets/gameEvents");

const app = express();
const server = http.createServer(app);

const ORIGIN = process.env.FRONTEND_URL || "https://alvaroso.dev";

const corsOptions = {
  origin: ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "username"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/user", userRoutes);
app.use("/text", textRoutes);
app.use("/test", testRoutes);
app.use("/ranking", rankingRoutes);
app.use("/match", matchRoutes);

const io = new Server(server, {
  cors: { origin: ORIGIN, methods: ["GET", "POST"] },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const username = socket.handshake.auth?.username;
  if (!token || !username) return next(new Error("Unauthorized"));
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    socket.data.username = username;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  registerEvents(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
