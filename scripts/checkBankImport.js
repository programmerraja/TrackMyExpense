const assert = require("assert");
const {
  importFingerprint,
  normalizeNarration,
} = require("../utils/bankImport");

assert.strictEqual(
  normalizeNarration("  UPI / FOOD@OKAXIS / 12345  "),
  "upi food@okaxis 12345",
);

const row = {
  bankNarration: "UPI / FOOD@OKAXIS / 12345",
  bankReference: "REF-1",
  eventDate: "2026-09-01T12:00:00.000Z",
  amount: -250,
};

assert.strictEqual(
  importFingerprint("user-1", row),
  importFingerprint("user-1", { ...row }),
);
assert.notStrictEqual(
  importFingerprint("user-1", row),
  importFingerprint("user-1", { ...row, bankReference: "REF-2" }),
);
assert.notStrictEqual(
  importFingerprint("user-1", row),
  importFingerprint("user-1", { ...row, amount: 250 }),
);
assert.strictEqual(importFingerprint("user-1", { amount: -250 }), undefined);

console.log("bank import check: ok");
