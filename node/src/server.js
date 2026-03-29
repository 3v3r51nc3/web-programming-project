// Backend developer: Maksym DOLHOV
import express from "express";
import cors from "cors";

import eventsRouter from "./routes/events.js";
import participantsRouter from "./routes/participants.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
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
