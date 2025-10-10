require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./lib/database");
const { ensureInitialSeeds } = require("./lib/seed");
const dashboardRouter = require("./routes/dashboard");
const pageContentRouter = require("./routes/page-content");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
  await connectDB(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecofinds");
  const seedInfo = await ensureInitialSeeds();

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

  app.use("/api/dashboard", dashboardRouter);
  app.use("/api", pageContentRouter);

    // Centralized error handler keeps responses consistent.
    app.use((err, _req, res, _next) => {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ message: "Unexpected server error." });
    });

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log("Server listening on", PORT, seedInfo);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend server", error);
    process.exit(1);
  }
}

bootstrap();
