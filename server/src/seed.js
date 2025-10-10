require("dotenv").config();

const { connectDB } = require("./lib/database");
const { ensureInitialSeeds } = require("./lib/seed");

(async () => {
  try {
  await connectDB(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecofinds");
  const result = await ensureInitialSeeds();
    // eslint-disable-next-line no-console
    console.log("Seed completed", result);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exit(1);
  }
})();
