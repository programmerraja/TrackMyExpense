// Read-only check against live data. Run: node scripts/checkPeople.js
require("dotenv").config({ path: "./.env" });
const assert = require("assert");
const { MongoClient } = require(process.env.MONGO_DRIVER_PATH || "mongodb");
const { EXPENSE_TYPE } = require("../controllers/expense");

const uri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "");

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const exp = client.db().collection("expenses");

  // The userId every entry is stored under is a string, which is the whole
  // reason the aggregations returned nothing before.
  const [userId] = await exp.distinct("userId");
  assert.strictEqual(typeof userId, "string", "userId is not a string");

  const people = await exp
    .aggregate([
      {
        $match: {
          userId,
          type: { $in: [EXPENSE_TYPE.DEBT_BOUGHT, EXPENSE_TYPE.DEBT_GIVEN] },
        },
      },
      {
        $group: {
          _id: "$name",
          net: { $sum: "$amount" },
          entries: { $sum: 1 },
          lastDate: { $max: "$eventDate" },
        },
      },
      { $sort: { lastDate: -1 } },
    ])
    .toArray();

  assert.ok(people.length > 0, "aggregation matched nothing for a real user");

  for (const p of people) {
    const owes = p.net < 0 ? "owes me" : p.net > 0 ? "I owe" : "settled";
    console.log(
      `${String(p._id).padEnd(14)} ${String(Math.abs(p.net)).padStart(7)}  ${owes.padEnd(9)} (${p.entries} entries)`,
    );
  }

  // Every person's net must equal the plain sum of their debt rows.
  for (const p of people) {
    const rows = await exp
      .find({
        userId,
        name: p._id,
        type: { $in: [EXPENSE_TYPE.DEBT_BOUGHT, EXPENSE_TYPE.DEBT_GIVEN] },
      })
      .toArray();
    const expected = rows.reduce((sum, r) => sum + r.amount, 0);
    assert.strictEqual(p.net, expected, `net mismatch for ${p._id}`);
    assert.strictEqual(p.entries, rows.length, `count mismatch for ${p._id}`);
  }

  console.log("people check: ok");
  await client.close();
}

main().catch((e) => {
  console.error("FAIL", e.name, e.message);
  process.exit(1);
});
