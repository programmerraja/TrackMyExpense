import {
  buildImportEntries,
  defaultMatchText,
  findBankMapping,
} from "./bankImport";

// Both rows are the same shop; only the VPA and reference differ.
const PAYTM_QR_A =
  "UPI-S JAGANATHAN-PAYTMQR147CEXCRD2@PAYTM-YESB0PTMUPI-520940632637-PAYMENT TO PAYTMQR";
const PAYTM_QR_B =
  "UPI-S JAGANATHAN-PAYTMQR6H8714@PTYS-YESB0PTMUPI-315325106984-PAYMENT TO PAYTMQR";

describe("payee matching", () => {
  test("groups the same payee across different VPAs and references", () => {
    expect(defaultMatchText(PAYTM_QR_A)).toBe("s jaganathan");
    expect(defaultMatchText(PAYTM_QR_B)).toBe("s jaganathan");
  });

  test("keeps different payees apart", () => {
    expect(
      defaultMatchText("UPI-ZOMATO LTD-ZOMATO@HDFCBANK-HDFC0001-99-PAY"),
    ).toBe("zomato ltd");
  });

  test("skips account codes to reach the name", () => {
    expect(defaultMatchText("ATW-416021XXXXXX1234-HDFC BANK-CHENNAI")).toBe(
      "hdfc bank",
    );
  });

  test("a saved rule matches later statements of the same payee", () => {
    const mapping = { matchText: "s jaganathan", direction: "debit" };
    const transaction = {
      narration: PAYTM_QR_B,
      debitAmount: 250,
      creditAmount: 0,
    };

    expect(findBankMapping(transaction, [mapping])).toBe(mapping);
  });

  test("a rule only matches the payee, not reference digits", () => {
    // "620" appears in this narration's reference number, never in the payee.
    const mapping = { matchText: "620", direction: "debit" };
    const transaction = {
      narration: PAYTM_QR_A,
      debitAmount: 250,
      creditAmount: 0,
    };

    expect(findBankMapping(transaction, [mapping])).toBeUndefined();
  });

  test("an empty rule never matches", () => {
    const transaction = {
      narration: PAYTM_QR_A,
      debitAmount: 250,
      creditAmount: 0,
    };

    expect(
      findBankMapping(transaction, [{ matchText: "", direction: "debit" }]),
    ).toBeUndefined();
  });

  test("a partial payee rule still matches", () => {
    const mapping = { matchText: "jaganathan", direction: "debit" };
    const transaction = {
      narration: PAYTM_QR_A,
      debitAmount: 250,
      creditAmount: 0,
    };

    expect(findBankMapping(transaction, [mapping])).toBe(mapping);
  });

  test("a debit rule does not match a credit", () => {
    const mapping = { matchText: "s jaganathan", direction: "debit" };
    const transaction = {
      narration: PAYTM_QR_A,
      debitAmount: 0,
      creditAmount: 250,
    };

    expect(findBankMapping(transaction, [mapping])).toBeUndefined();
  });
});

const amounts = (rows) => rows.map((row) => row.amount).sort((a, b) => a - b);

const entry = (overrides) => ({
  tempId: Math.random().toString(),
  narration: "n",
  direction: "debit",
  matchText: "shop a",
  assigned: true,
  selected: true,
  type: "EXPENSE",
  name: "shop a",
  category: "food",
  amount: -100,
  eventDate: "2026-09-04T00:00:00.000Z",
  bankReference: "",
  ...overrides,
});

describe("building entries", () => {
  // Three shops, one month of eating out.
  const food = [
    entry({ matchText: "shop a", name: "shop a", amount: -100 }),
    entry({ matchText: "shop b", name: "shop b", amount: -250 }),
    entry({
      matchText: "shop b",
      name: "shop b",
      amount: -50,
      eventDate: "2026-09-20T00:00:00.000Z",
    }),
  ];

  test("month collapses every payee in the category into one row", () => {
    const rows = buildImportEntries(food, {
      "EXPENSE:food": { granularity: "month", description: "Food" },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(-400);
    expect(rows[0].name).toBe("food");
    expect(rows[0].eventDate).toBe("2026-09-20T00:00:00.000Z");
  });

  test("month keeps separate calendar months apart", () => {
    const rows = buildImportEntries(
      [...food, entry({ amount: -70, eventDate: "2026-10-02T00:00:00.000Z" })],
      { "EXPENSE:food": { granularity: "month" } },
    );

    expect(rows).toHaveLength(2);
    expect(amounts(rows)).toEqual([-400, -70]);
  });

  test("payee keeps one row per shop", () => {
    const rows = buildImportEntries(food, {
      "EXPENSE:food": { granularity: "payee" },
    });

    expect(rows).toHaveLength(2);
    expect(amounts(rows)).toEqual([-300, -100]);
  });

  test("transaction writes every line", () => {
    const rows = buildImportEntries(food, {
      "EXPENSE:food": { granularity: "transaction" },
    });

    expect(rows).toHaveLength(3);
  });

  test("defaults to one entry for the month", () => {
    const rows = buildImportEntries(food, {});

    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(-400);
  });

  test("collapsed rows get a stable duplicate key", () => {
    const settings = { "EXPENSE:food": { granularity: "month" } };
    const first = buildImportEntries(food, settings);
    const again = buildImportEntries(food, settings);

    expect(first[0].bankNarration).toBe(again[0].bankNarration);
    expect(first[0].bankReference).toBe("");
  });

  test("skipped, unassigned and deselected rows never import", () => {
    const rows = buildImportEntries(
      [
        entry({ type: "SKIP" }),
        entry({ assigned: false }),
        entry({ selected: false }),
      ],
      {},
    );

    expect(rows).toHaveLength(0);
  });

  test("debt buckets stay per person", () => {
    const rows = buildImportEntries(
      [
        entry({ type: "DEBT_GIVEN", name: "selvam", amount: -500 }),
        entry({ type: "DEBT_GIVEN", name: "praveen", amount: -300 }),
      ],
      {
        "DEBT_GIVEN:selvam": { granularity: "month" },
        "DEBT_GIVEN:praveen": { granularity: "month" },
      },
    );

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.name).sort()).toEqual(["praveen", "selvam"]);
  });
});
