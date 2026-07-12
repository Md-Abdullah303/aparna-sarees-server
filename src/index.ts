import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import sareeRoutes from "./routes/saree.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── Middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // needed for cookies (better-auth session)
  })
);
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "🧣 Aparna Sarees API — running!" });
});

app.use("/api/sarees", sareeRoutes);

// ─── Start ────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }
}

startServer();
