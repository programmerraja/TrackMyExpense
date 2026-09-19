export const normalizeNarration = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9@._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const transactionDirection = (transaction) =>
  transaction.debitAmount > 0 ? "debit" : "credit";

export const isDebtType = (type) =>
  type === "DEBT_GIVEN" || type === "DEBT_BOUGHT";

// Bank narrations read as `CHANNEL-WHO-ACCOUNT-BANK-REFERENCE-REMARK`, and only
// the "who" is stable: the same shop reaches you under a fresh VPA and a fresh
// reference every single time.
const CHANNEL_PREFIXES = [
  "upi",
  "imps",
  "neft",
  "rtgs",
  "mmt",
  "ach",
  "nach",
  "ecs",
  "pos",
  "atw",
  "chq",
  "inf",
];

const looksLikeName = (segment) =>
  /[a-z]/.test(segment) && !segment.includes("@") && !/\d{4,}/.test(segment);

export const defaultMatchText = (narration) => {
  const segments = String(narration || "")
    .split("-")
    .map(normalizeNarration)
    .filter(Boolean);

  if (!segments.length) return "";

  const start = CHANNEL_PREFIXES.includes(segments[0].split(" ")[0]) ? 1 : 0;
  return segments.slice(start).find(looksLikeName) || segments[start] || segments[0];
};

// Matched against the payee alone, never the whole narration: reference
// numbers and bank codes would otherwise contain a short rule's text and drag
// unrelated transactions into a category.
export const findBankMapping = (transaction, mappings) => {
  const payee = defaultMatchText(transaction.narration);
  const direction = transactionDirection(transaction);
  if (!payee) return undefined;

  return [...mappings]
    .filter((mapping) => {
      const text = normalizeNarration(mapping.matchText);
      return text && mapping.direction === direction && payee.includes(text);
    })
    .sort((a, b) => b.matchText.length - a.matchText.length)[0];
};

// Many payees land in one bucket on purpose: eleven food shops are still one
// month of food. Debt keeps a bucket per person, since that is the balance.
export const bucketKey = (entry) => {
  if (entry.type === "SKIP") return "SKIP";
  return `${entry.type}:${
    isDebtType(entry.type) ? entry.name : entry.category
  }`;
};

export const bucketLabel = (entry) =>
  isDebtType(entry.type) ? entry.name : entry.category;

const monthOf = (date) => new Date(date).toISOString().slice(0, 7);

const latestDate = (items) =>
  items.reduce((newest, item) =>
    new Date(item.eventDate) > new Date(newest.eventDate) ? item : newest,
  ).eventDate;

const sumOf = (items) => items.reduce((total, item) => total + item.amount, 0);

const groupBy = (items, keyOf) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
};

/**
 * Turns reviewed transactions into the rows that will be written.
 * `granularity` is per bucket: "month" collapses every payee in the category
 * into one row per calendar month, "payee" keeps one row per shop, and
 * "transaction" writes each line as it came from the bank.
 */
export function buildImportEntries(entries, settings = {}) {
  const rows = [];
  const selected = entries.filter(
    (entry) => entry.selected && entry.assigned && entry.type !== "SKIP",
  );

  groupBy(selected, bucketKey).forEach((items, key) => {
    const { granularity = "month", description } = settings[key] || {};
    const head = items[0];
    const common = {
      type: head.type,
      category: head.category,
    };

    if (granularity === "transaction") {
      items.forEach((entry) =>
        rows.push({
          ...common,
          name: entry.name.trim().toLowerCase(),
          amount: entry.amount,
          eventDate: entry.eventDate,
          note: entry.bankReference
            ? `Bank reference: ${entry.bankReference}`
            : "Imported from bank statement",
          bankNarration: entry.narration,
          bankReference: entry.bankReference,
        }),
      );
      return;
    }

    const keyOf =
      granularity === "month"
        ? (entry) => monthOf(entry.eventDate)
        : (entry) => entry.matchText;

    groupBy(items, keyOf).forEach((group, groupId) => {
      const label =
        granularity === "month"
          ? description || bucketLabel(head)
          : group[0].name;

      rows.push({
        ...common,
        name: String(label).trim().toLowerCase(),
        amount: sumOf(group),
        eventDate: latestDate(group),
        note:
          group.length === 1
            ? "Imported from bank statement"
            : `${group.length} bank transactions`,
        // A collapsed row stands for a rule rather than one bank line, so its
        // duplicate key has to come from the rule.
        bankNarration: `${key}|${groupId}`,
        bankReference: "",
      });
    });
  });

  return rows;
}
