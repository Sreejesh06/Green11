require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./lib/database");
const { ensureInitialSeeds } = require("./lib/seed");
const { authMiddleware } = require("./lib/auth");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const settingsRouter = require("./routes/settings");
const rewardsRouter = require("./routes/rewards");
const {
  protectedRouter: protectedPageContentRouter,
  publicRouter: publicPageContentRouter,
} = require("./routes/page-content");

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required to start the server.");
}

async function bootstrap() {
  try {
    await connectDB(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecofinds");
    const seedInfo = await ensureInitialSeeds();

    const app = express();

    app.use(cors());
    app.use(
      express.json({
        limit: process.env.REQUEST_BODY_LIMIT || "6mb",
      })
    );
    app.use(
      express.urlencoded({
        extended: true,
        limit: process.env.REQUEST_BODY_LIMIT || "6mb",
      })
    );

    app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

  app.use("/api/auth", authRouter);
  app.use("/api", publicPageContentRouter);
  app.use("/api/dashboard", authMiddleware, dashboardRouter);
  app.use("/api/rewards", authMiddleware, rewardsRouter);
  app.use("/api/settings", authMiddleware, settingsRouter);
  app.use("/api", authMiddleware, protectedPageContentRouter);

    // Centralized error handler keeps responses consistent.
    app.use((err, _req, res, _next) => {
      if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Request payload is too large." });
      }
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
