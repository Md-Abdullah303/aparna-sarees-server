import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import sareeRoutes from "./routes/saree.routes";
import contactRoutes from "./routes/contact.routes";
import stripeRoutes from "./routes/stripe.routes";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const ALLOWED_ORIGINS = [CLIENT_URL, "http://localhost:3000"];

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Aparna Sarees API — running!" });
});

app.use("/api/sarees", sareeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stripe", stripeRoutes);

export default app;
