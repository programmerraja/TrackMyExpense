const Expense = require("../models/expense");
const dayjs = require("dayjs");
const {
  resolveWorkspace,
  workspaceCondition,
} = require("./workspace");
const { importFingerprint } = require("../utils/bankImport");

const EXPENSE_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  DEBT_BOUGHT: "DEBT_BOUGHT",
  DEBT: "DEBT",
  DEBT_GIVEN: "DEBT_GIVEN",
  INVESTMENT: "INVESTMENT",
  DASHBOARD: "DASHBOARD",
  INCOME_TAX: "INCOME_TAX",
};

exports.EXPENSE_TYPE = EXPENSE_TYPE;

const WORKSPACE_SCOPED_TYPES = [
  EXPENSE_TYPE.EXPENSE,
  EXPENSE_TYPE.INCOME,
];

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function withWorkspace(user, data) {
  if (!WORKSPACE_SCOPED_TYPES.includes(data.type)) {
    const { workspaceId, ...globalData } = data;
    return globalData;
  }

  const { workspace } = await resolveWorkspace(user, data.workspaceId);
  return { ...data, workspaceId: String(workspace._id) };
}

// Only these types have one possible direction, so their sign is decided here,
// where every write converges (the bank-statement import sends debits as
// positive and would otherwise store spending as income). Debt and investment
// signs are left alone: there the sign carries meaning the server can't infer,
// such as a repayment or a booked profit.
const FIXED_SIGN_BY_TYPE = {
  [EXPENSE_TYPE.EXPENSE]: -1,
  [EXPENSE_TYPE.INCOME_TAX]: -1,
  [EXPENSE_TYPE.INCOME]: 1,
};

function withSignedAmount(data) {
  const sign = FIXED_SIGN_BY_TYPE[data.type];
  if (!sign || data.amount === undefined || data.amount === null) {
    return data;
  }
  const magnitude = Math.abs(Number(data.amount));
  if (Number.isNaN(magnitude)) {
    return data;
  }
  return { ...data, amount: sign * magnitude };
}

exports.withSignedAmount = withSignedAmount;

const FAMILY_CATEGORY = "home";
exports.FAMILY_CATEGORY = FAMILY_CATEGORY;

exports.searchExpense = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(escapeRegExp(q), "i");
    const { workspace } = await resolveWorkspace(
      req.user,
      req.query.workspaceId,
    );
    const scopedWorkspace = workspaceCondition(workspace);
    const results = await Expense.find({
      userId: String(req.user._id),
      $and: [
        { $or: [{ name: regex }, { note: regex }, { category: regex }] },
        {
          $or: [
            { type: { $nin: WORKSPACE_SCOPED_TYPES } },
            {
              $and: [
                { type: { $in: WORKSPACE_SCOPED_TYPES } },
                scopedWorkspace,
              ],
            },
          ],
        },
      ],
    })
      .sort({ eventDate: -1 })
      .limit(100)
      .select(
        "name amount type category eventDate note isRecurring recurringFrequency",
      );

    return res.status(200).json({ success: true, data: results, query: q });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

async function getData(type, basicMatchQuery) {
  const projection = {
    name: 1,
    type: 1,
    note: 1,
    amount: 1,
    category: 1,
    eventDate: 1,
    isRecurring: 1,
    recurringFrequency: 1,
    vault: 1,
    workspaceId: 1,
  };

  const aggregations = {
    DASHBOARD: [
      {
        $match: {
          ...basicMatchQuery,
          type: { $in: WORKSPACE_SCOPED_TYPES },
        },
      },
      {
        $group: {
          // Money sent home is reported apart from own spending: it is the
          // largest outflow and buries every other category when mixed in.
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
    ],
    INCOME: [
      {
        $match: { ...basicMatchQuery, type: EXPENSE_TYPE.INCOME },
      },
      {
        $group: { _id: "$type", amount: { $sum: "$amount" } },
      },
    ],
    DEBT: [
      {
        $match: {
          ...basicMatchQuery,
          $or: [
            { type: EXPENSE_TYPE.DEBT_BOUGHT },
            { type: EXPENSE_TYPE.DEBT_GIVEN },
          ],
        },
      },
      {
        $group: { _id: "$name", amount: { $sum: "$amount" } },
      },
    ],
    EXPENSE: [
      {
        // Family money is only listed when asked for by category, so this page
        // totals the same own spending the dashboard shows.
        $match: {
          ...basicMatchQuery,
          type: EXPENSE_TYPE.EXPENSE,
          ...(basicMatchQuery.category
            ? {}
            : { category: { $ne: FAMILY_CATEGORY } }),
        },
      },
      {
        $group: { _id: "$category", amount: { $sum: "$amount" } },
      },
    ],
    INCOME_TAX: [
      {
        $match: { ...basicMatchQuery, type: EXPENSE_TYPE.INCOME_TAX },
      },
      {
        $group: { _id: "$category", amount: { $sum: "$amount" } },
      },
    ],
    INVESTMENT: [
      {
        $match: { ...basicMatchQuery, type: EXPENSE_TYPE.INVESTMENT },
      },
      {
        $group: { _id: "$category", amount: { $sum: "$amount" } },
      },
    ],
  };

  if (type === "DASHBOARD") {
    return {
      group: await Expense.aggregate(aggregations[type]),
    };
  }

  const result = {
    group: await Expense.aggregate(aggregations[type]),
    content: await Expense.find(
      aggregations[type][0]["$match"],
      projection,
    ).sort({ eventDate: -1 }),
  };

  if (type === EXPENSE_TYPE.INCOME) {
    result.total = result.group.reduce((acc, curr) => acc + curr.amount, 0);
  }

  return result;
}

exports.getExpense = async (req, res, next) => {
  try {
    const startDate = req.query.start || dayjs().startOf("M").toISOString();
    const endDate = req.query.end || dayjs().endOf("D").toISOString();
    const name = req.query.name;

    // userId is a string in the schema, and mongoose does not cast $match in an
    // aggregation the way it casts find(), so an ObjectId here matches nothing
    // and every total comes back empty while the tables still fill.
    const userId = String(req.user._id);

    let basicMatchQuery = {
      userId,
      eventDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (req.query.all) {
      delete basicMatchQuery.eventDate;
    }
    if (name) {
      basicMatchQuery["name"] = new RegExp(`^${name}$`, "i");
    }
    if (req.query.category) {
      basicMatchQuery["category"] = new RegExp(`^${req.query.category}$`, "i");
    }
    if (req.query.vault) {
      basicMatchQuery["vault"] = req.query.vault;
    }

    if (req.query.type === EXPENSE_TYPE.INCOME_TAX) {
      basicMatchQuery = { userId };
    }

    if (
      req.query.type === EXPENSE_TYPE.DASHBOARD ||
      WORKSPACE_SCOPED_TYPES.includes(req.query.type)
    ) {
      const { workspace } = await resolveWorkspace(
        req.user,
        req.query.workspaceId,
      );
      Object.assign(basicMatchQuery, workspaceCondition(workspace));
    }

    const expenses = await getData(req.query.type, basicMatchQuery);

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    console.log(err, "etrr");
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// One row per person: the net of what they handed you (DEBT_BOUGHT, positive)
// and what you handed them (DEBT_GIVEN, negative). A positive net means you owe
// them, negative means they owe you.
exports.getPeople = async (req, res) => {
  try {
    const people = await Expense.aggregate([
      {
        $match: {
          userId: String(req.user._id),
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
    ]);

    return res.status(200).json({ success: true, data: people });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    let response;
    if (req.body._id) {
      const { _id, ...data } = req.body;
      const existing = await Expense.findOne({
        _id,
        userId: String(req.user._id),
      });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Entry not found",
        });
      }
      const updateData = await withWorkspace(req.user, {
        ...data,
        type: data.type || existing.type,
        // Editing changes the entry, not which book it belongs to.
        workspaceId: existing.workspaceId || undefined,
      });
      response = await Expense.updateOne(
        { _id, userId: String(req.user._id) },
        withSignedAmount(updateData),
      );
    } else {
      let expenseData = await withWorkspace(req.user, {
        ...req.body,
        userId: String(req.user._id),
      });
      expenseData = withSignedAmount(expenseData);
      expenseData.importFingerprint = importFingerprint(
        String(req.user._id),
        expenseData,
      );
      if (
        expenseData.importFingerprint &&
        (await Expense.exists({
          userId: String(req.user._id),
          importFingerprint: expenseData.importFingerprint,
        }))
      ) {
        return res.status(409).json({
          success: false,
          error: "This bank transaction was already imported",
        });
      }

      // Auto-allocation logic for salary
      const budgetSettings = req.user.budgetSettings;
      if (
        expenseData.type === EXPENSE_TYPE.INCOME &&
        expenseData.name &&
        expenseData.name.toLowerCase().includes("salary") &&
        budgetSettings?.baseSalaryLimit > 0 &&
        expenseData.amount > budgetSettings.baseSalaryLimit
      ) {
        const limit = budgetSettings.baseSalaryLimit;
        const surplus = expenseData.amount - limit;
        const autoVault = budgetSettings.autoAllocationVault || "emergency";

        // Create the surplus entry first
        await Expense.create({
          ...expenseData,
          // One bank transaction can split into two salary rows. Keep its
          // duplicate key on the primary row only.
          importFingerprint: undefined,
          amount: surplus,
          vault: autoVault,
          note: expenseData.note
            ? `${expenseData.note} (Auto-allocated surplus)`
            : "Auto-allocated surplus salary",
        });

        // Current entry becomes the balance (the "public" amount)
        expenseData.amount = limit;
        expenseData.vault = "primary";
      }

      response = await Expense.create(expenseData);
    }

    return res.status(201).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else if (err.code === 11000 && err.keyPattern?.importFingerprint) {
      return res.status(409).json({
        success: false,
        error: "This bank transaction was already imported",
      });
    } else {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

exports.editExpense = async (req, res, next) => {
  try {
    const existing = await Expense.findOne({
      _id: req.params.id,
      userId: String(req.user._id),
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Entry not found",
      });
    }
    const updateData = await withWorkspace(req.user, {
      ...req.body,
      type: req.body.type || existing.type,
      workspaceId: existing.workspaceId || undefined,
    });
    const month = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: String(req.user._id) },
      withSignedAmount(updateData),
      { new: true, runValidators: true },
    );

    return res.status(201).json({
      success: true,
      data: month,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const month = await Expense.deleteOne({
      userId: req.user._id,
      _id: req.params.id,
    });

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.processRecurring = async (req, res, next) => {
  try {
    const now = new Date();
    const recurring = await Expense.find({
      userId: req.user._id,
      isRecurring: true,
    });

    let created = 0;
    for (const entry of recurring) {
      const lastDate = new Date(entry.eventDate);
      let nextDate;

      switch (entry.recurringFrequency) {
        case "weekly":
          nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "yearly":
          nextDate = new Date(lastDate);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          continue;
      }

      // Create entries until we catch up to today
      while (nextDate <= now) {
        await Expense.create({
          userId: entry.userId,
          workspaceId: entry.workspaceId,
          type: entry.type,
          name: entry.name,
          amount: entry.amount,
          category: entry.category,
          note: entry.note ? `${entry.note} (recurring)` : "(recurring)",
          eventDate: new Date(nextDate),
          isRecurring: false, // generated entries are not recurring themselves
          vault: entry.vault,
        });
        created++;

        // Move the source entry's eventDate forward
        await Expense.updateOne(
          { _id: entry._id },
          { eventDate: new Date(nextDate) },
        );

        // Calculate next occurrence
        switch (entry.recurringFrequency) {
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: { processed: recurring.length, created },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
