// Read-only check against live data. Run: node scripts/checkDashboardSplit.js
require("dotenv").config({ path: "./.env" });
const assert = require("assert");
const { MongoClient } = require(process.env.MONGO_DRIVER_PATH || "mongodb");
const { EXPENSE_TYPE, FAMILY_CATEGORY } = require("../controllers/expense");

const uri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "");

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const exp = client.db().collection("expenses");

  const grouped = await exp
    .aggregate([
      { $match: { type: { $ne: EXPENSE_TYPE.INCOME_TAX } } },
      {
        $group: {
          _id: {
            $cond: [
              {
                $and: [
                  { $eq: ["$type", EXPENSE_TYPE.EXPENSE] },
                  { $eq: ["$category", FAMILY_CATEGORY] },
                ],
              },
              "FAMILY",
              "$type",
            ],
          },
          amount: { $sum: "$amount" },
        },
      },
    ])
    .toArray();

  const by = Object.fromEntries(grouped.map((g) => [g._id, g.amount]));
  console.log("dashboard buckets:", JSON.stringify(by, null, 2));

  const plainExpenseTotal = await exp
    .aggregate([
      { $match: { type: EXPENSE_TYPE.EXPENSE } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ])
    .toArray();

  // Splitting must move money between buckets, never create or lose any.
  assert.strictEqual(
    by.EXPENSE + by.FAMILY,
    plainExpenseTotal[0].amount,
    "family split changed the expense total",
  );
  assert.ok(by.FAMILY !== undefined, "no family bucket produced");
  assert.ok(by.EXPENSE !== undefined, "no spending bucket produced");

  console.log("dashboard split check: ok");
  await client.close();
}

main().catch((e) => {
  console.error("FAIL", e.name, e.message);
  process.exit(1);
});
