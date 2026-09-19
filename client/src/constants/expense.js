// Shared entry constants. This module imports nothing on purpose: Dashboard
// renders AddButton and AddButton needs these values, so keeping them here
// avoids a circular import between the two.

export const EXPENSE_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  DEBT_BOUGHT: "DEBT_BOUGHT",
  DEBT: "DEBT",
  DEBT_GIVEN: "DEBT_GIVEN",
  INVESTMENT: "INVESTMENT",
  DASHBOARD: "DASHBOARD",
  INCOME_TAX: "INCOME_TAX",
};

export const WORKSPACE_SCOPED_TYPES = [
  EXPENSE_TYPE.EXPENSE,
  EXPENSE_TYPE.INCOME,
];

export const URL_MAPPER = {
  INCOME: "income",
  EXPENSE: "expense",
  DEBT_BOUGHT: "debt",
  DEBT: "debt",
  DEBT_GIVEN: "debt",
  INVESTMENT: "investment",
  DASHBOARD: "#",
};

export const FAMILY_CATEGORY = "home";

// Picking this category files the entry under the emergency fund, so the money
// lands in one pot with the salary surplus the server allocates there.
export const EMERGENCY_CATEGORY = "emergency";
export const EMERGENCY_VAULT = "emergency";

export const CATEGORIES = [
  "food",
  "bills",
  "rent",
  "home",
  "travel",
  "medical",
  "shopping",
  "entertainment",
  "friends",
  "sports",
  "salary",
  "savings",
  "emergency",
  "tax",
  "other",
];

const CATEGORY_LABELS = {
  [FAMILY_CATEGORY]: "Sent home",
  [EMERGENCY_CATEGORY]: "Emergency fund",
};

export const categoryLabel = (category) =>
  CATEGORY_LABELS[category] || category;

// The one rule for money colour: it follows the sign, never the label. Money
// that left the account is red wherever it shows up, including debt you are
// still owed, because that cash is out of your pocket until it comes back.
export const amountClass = (amount) =>
  amount < 0 ? "text-money-out" : "text-money-in";
