import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import filmRoutes from "./routes/films.routes.js";

dotenv.config();

const app = express();

// Security & parsing middleware
app.use(helmet());       // secure HTTP headers
app.use(cors());         // browser-safe API
app.use(express.json()); // parse JSON bodies

// Health check (used by load balancers)
app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// Routes
app.use("/films", filmRoutes);

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`MiniFilm SaaS API running on port ${port}`);
});
