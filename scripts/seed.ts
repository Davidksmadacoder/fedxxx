/**
 * Manual seed runner. Loads .env via dotenv, connects to DB, runs seed.
 * Run: npm run seed (requires MONGODB_URI in .env)
 */
import "dotenv/config";
import { dbConnect } from "../src/lib/utils/dbConnect.utils";
import runSeed from "../src/lib/utils/seed.utils";

async function main() {
  await dbConnect();
  await runSeed();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
