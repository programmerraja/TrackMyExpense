// Read-only. Run: node scripts/listPositiveExpenses.js
require("dotenv").config({ path: "./.env" });
const { MongoClient } = require(process.env.MONGO_DRIVER_PATH || "mongodb");

const uri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "");

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const exp = client.db().collection("expenses");

  const rows = await exp
    .find({ type: { $in: ["EXPENSE", "INCOME_TAX"] }, amount: { $gt: 0 } })
    .sort({ amount: -1 })
    .project({ type: 1, name: 1, category: 1, amount: 1, eventDate: 1, note: 1 })
    .toArray();

  for (const r of rows) {
    console.log(
      [
        r.eventDate.toISOString().slice(0, 10),
        r.type.padEnd(10),
        String(r.amount).padStart(7),
        (r.name || "").padEnd(18),
        (r.category || "").padEnd(14),
        (r.note || "").slice(0, 45),
      ].join("  "),
    );
  }
  console.log("total rows:", rows.length);

  await client.close();
}

main().catch((e) => {
  console.error("FAIL", e.name, e.message);
  process.exit(1);
});
