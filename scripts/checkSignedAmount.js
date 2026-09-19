// Run: node scripts/checkSignedAmount.js
const assert = require("assert");
const { EXPENSE_TYPE, withSignedAmount } = require("../controllers/expense");

const amountFor = (type, amount) => withSignedAmount({ type, amount }).amount;

// Bank-statement import sends debits as positive; they must land negative.
assert.strictEqual(amountFor(EXPENSE_TYPE.EXPENSE, 15000), -15000);
assert.strictEqual(amountFor(EXPENSE_TYPE.INCOME_TAX, 41680), -41680);

// Income lands positive whichever sign arrived.
assert.strictEqual(amountFor(EXPENSE_TYPE.INCOME, -102128), 102128);

// Debt and investment signs are the user's to set: a positive DEBT_GIVEN is a
// repayment received, a positive INVESTMENT is a booked profit.
assert.strictEqual(amountFor(EXPENSE_TYPE.DEBT_GIVEN, 1000), 1000);
assert.strictEqual(amountFor(EXPENSE_TYPE.DEBT_GIVEN, -32000), -32000);
assert.strictEqual(amountFor(EXPENSE_TYPE.DEBT_BOUGHT, 20000), 20000);
assert.strictEqual(amountFor(EXPENSE_TYPE.INVESTMENT, 10000), 10000);

// Re-saving an already-correct entry must not flip it (the edit-form bug).
assert.strictEqual(amountFor(EXPENSE_TYPE.EXPENSE, -297), -297);
assert.strictEqual(amountFor(EXPENSE_TYPE.INCOME, 102128), 102128);

// String amounts arrive from form inputs.
assert.strictEqual(amountFor(EXPENSE_TYPE.EXPENSE, "706"), -706);

// Partial updates without amount/type pass through untouched.
assert.deepStrictEqual(withSignedAmount({ note: "hi" }), { note: "hi" });
assert.deepStrictEqual(withSignedAmount({ amount: 50 }), { amount: 50 });
assert.deepStrictEqual(withSignedAmount({ type: EXPENSE_TYPE.EXPENSE }), {
  type: EXPENSE_TYPE.EXPENSE,
});

console.log("signed amount check: ok");
