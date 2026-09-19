// Repairs rows written before withSignedAmount existed, which stored expenses
// and taxes as positive. They rendered green and, worse, cancelled out real
// amounts in every total.
//
// Goes through the running API rather than the driver so the server applies the
// same normalisation a normal edit would. Idempotent: rows already correct are
// skipped, so a second run reports nothing to fix.
//
// Dry run:  API_TOKEN=... node scripts/backfillSigns.js
// Apply:    API_TOKEN=... node scripts/backfillSigns.js --apply
const { EXPENSE_TYPE, withSignedAmount } = require("../controllers/expense");

const BASE = process.env.API_URL || "http://localhost:9000";
const TOKEN = process.env.API_TOKEN;
const APPLY = process.argv.includes("--apply");

const TYPES = [
  EXPENSE_TYPE.EXPENSE,
  EXPENSE_TYPE.INCOME,
  EXPENSE_TYPE.INCOME_TAX,
];

const authHeaders = { Authorization: `Bearer ${TOKEN}` };

async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`${init?.method || "GET"} ${path} -> ${res.status}`);
  }
  return res.json();
}

async function main() {
  if (!TOKEN) throw new Error("set API_TOKEN");

  let fixed = 0;
  for (const type of TYPES) {
    const body = await request(`/api/v1/expense/?all=true&type=${type}`, {
      headers: authHeaders,
    });
    const rows = (body.data && body.data.content) || [];
    const wrong = rows.filter(
      (row) => withSignedAmount({ type, amount: row.amount }).amount !== row.amount,
    );

    console.log(`${type}: ${wrong.length} of ${rows.length} rows need fixing`);
    for (const row of wrong) {
      const target = withSignedAmount({ type, amount: row.amount }).amount;
      console.log(
        `  ${row.eventDate.slice(0, 10)}  ${row.name}  ${row.amount} -> ${target}`,
      );
      if (!APPLY) continue;

      await request(`/api/v1/expense/${row._id}`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.abs(row.amount) }),
      });
      fixed += 1;
    }
  }

  console.log(APPLY ? `updated ${fixed} rows` : "dry run, pass --apply to write");
}

main().catch((err) => {
  console.error("FAIL", err.message);
  process.exit(1);
});
