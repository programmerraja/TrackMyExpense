const Expense = require("../models/expense");
const dayjs = require("dayjs");

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

async function getData(type, basicMatchQuery) {
  const projection = {
    name: 1,
    type: 1,
    note: 1,
    amount: 1,
    category: 1,
    eventDate: 1,
  };

  const aggregations = {
    DASHBOARD: [
      {
        $match: { ...basicMatchQuery, type: { $ne: EXPENSE_TYPE.INCOME_TAX } },
      },
      { $group: { _id: "$type", amount: { $sum: "$amount" } } },
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
        $match: { ...basicMatchQuery, type: EXPENSE_TYPE.EXPENSE },
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
    const query = aggregations[type];
    query.push({ $sort: { eventDate: -1 } });
    return { group: await Expense.aggregate(query) };
  }

  const result = {
    group: await Expense.aggregate(aggregations[type]),
    content: await Expense.find(aggregations[type][0]["$match"], projection).sort({ eventDate: -1 }),
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

    let basicMatchQuery = {
      userId: req.user._id,
      eventDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (req.query.all) {
      delete basicMatchQuery.eventDate;
    }
    if (name) {
      basicMatchQuery["name"] = name.toLowerCase();
    }
    if (req.query.category) {
      basicMatchQuery["category"] = req.query.category.toLowerCase();
    }

    if (req.query.type === EXPENSE_TYPE.INCOME_TAX) {
      basicMatchQuery = { userId: req.user._id };
    }
    const expenses = await getData(req.query.type, basicMatchQuery, req.query);

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    console.log(err, "etrr");
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    let response;
    if (req.body._id) {
      const { _id, ...data } = req.body;
      response = await Expense.updateOne(
        { _id: req.body._id, userId: req.user._id },
        data
      );
    } else {
      response = await Expense.create({
        userId: req.user._id,
        ...req.body,
      });
    }

    return res.status(201).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
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
    const month = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body }
    );

    return res.status(201).json({
      success: true,
      data: month,
    });
  } catch (err) {
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
