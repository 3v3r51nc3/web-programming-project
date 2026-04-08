// Backend developer: Maksym DOLHOV
import express from "express";
import cors from "cors";

import eventsRouter from "./routes/events.js";
import participantsRouter from "./routes/participants.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
}));
app.use(express.json());

// Routes
app.use("/api/events", eventsRouter);
app.use("/api/participants", participantsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "eventhub-node-backend" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: true, status_code: 404, details: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Node backend listening on http://localhost:${port}`);
});
