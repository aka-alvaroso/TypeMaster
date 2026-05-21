// index.js
const express = require("express");
const app = express();
const textRoutes = require("./routes/textRoutes");
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const cors = require("cors");

const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://alvaroso.dev",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "username"],
};

app.use(cors(corsOptions));

app.use(express.json());

// Evitar que el navegador cachee respuestas de la API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Autenticación
app.use("/user", userRoutes);

app.use("/text", textRoutes);

app.use("/test", testRoutes);

app.use("/ranking", rankingRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
