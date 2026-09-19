const crypto = require("crypto");

function normalizeNarration(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function transactionDirection(data) {
  return Number(data.amount) < 0 ? "debit" : "credit";
}

function importFingerprint(userId, data) {
  if (!data.bankNarration || !data.eventDate) return undefined;

  const date = new Date(data.eventDate);
  if (Number.isNaN(date.getTime())) return undefined;

  // ponytail: banks without references can make two identical same-day rows
  // collide; add a persisted statement-row ledger if that occurs in real data.
  const identity = [
    userId,
    date.toISOString().slice(0, 10),
    Math.abs(Number(data.amount)),
    normalizeNarration(data.bankReference || data.bankNarration),
    transactionDirection(data),
  ].join("|");

  return crypto.createHash("sha256").update(identity).digest("hex");
}

module.exports = {
  importFingerprint,
  normalizeNarration,
  transactionDirection,
};
