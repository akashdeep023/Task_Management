const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const DEFAULT_FRONTEND_URL =
  "https://taskmanagementfrontend-production-52aa.up.railway.app";

const configuredOrigins = [
  DEFAULT_FRONTEND_URL,
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const allowedOrigins = [...new Set(configuredOrigins)];

const corsOptions = {
  origin(origin, callback) {
    // Requests without Origin (health checks, curl, server-to-server) are allowed.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const taskRoute = require("./routes/task");
const analyticsRoute = require("./routes/analytics");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Task_Management!",
    database:
      mongoose.connection.readyState === 1
        ? mongoose.connection.name
        : "disconnected",
    frontend_url: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  });
});

// Railway health check
app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "error",
    database: databaseConnected
      ? mongoose.connection.name
      : "disconnected",
  });
});

// All routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/task", taskRoute);
app.use("/api/analytics", analyticsRoute);

// Invalid routes
app.all("*", (req, res) => {
  res.status(404).json({ error: "Invalid Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const errorMessage = err.message || "Something Went Wrong!";
  res.status(500).json({ message: errorMessage });
});

async function startServer(port = PORT, host = "0.0.0.0") {
  try {
    await connectDatabase();

    const server = app.listen(port, host, () => {
      console.log(`Server listening on ${host}:${server.address().port}`);
      console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
    });
    return server;
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exitCode = 1;
    throw error;
  }
}

if (require.main === module) {
  startServer().catch(() => {});
}

module.exports = { app, startServer };
