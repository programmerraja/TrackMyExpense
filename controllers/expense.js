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
};

exports.EXPENSE_TYPE = EXPENSE_TYPE;

async function getData(type, basicMatchQuery, params) {
  console.log(type, "type");
  const projection = {
    name: 1,
    type: 1,
    note: 1,
    amount: 1,
    category: 1,
    eventDate: 1,
  };
  if (type === "DASHBOARD") {
    const aggregation = [
      {
        $match: basicMatchQuery,
      },
      { $group: { _id: "$type", amount: { $sum: "$amount" } } },
    ];

    return { group: await Expense.aggregate(aggregation) };
  }

  if (type === EXPENSE_TYPE.INCOME) {
    const result = {
      total: 0,
      content: [],
    };

    const incomeAggregation = [
      {
        $match: {
          ...basicMatchQuery,
          type: EXPENSE_TYPE.INCOME,
        },
      },
      {
        $group: {
          _id: "$type",
          amount: { $sum: "$amount" },
        },
      },
    ];

    result.group = await Expense.aggregate(incomeAggregation);
    result.content = await Expense.find(
      incomeAggregation[0]["$match"],
      projection
    );
    return result;
  }

  if (type === EXPENSE_TYPE.DEBT) {
    const result = {
      content: [],
      group: [],
    };

    const debtAggregation = [
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
        $group: {
          _id: "$name",
          amount: { $sum: "$amount" },
        },
      },
    ];

    result.group = await Expense.aggregate(debtAggregation);
    result.content = await Expense.find(
      debtAggregation[0]["$match"],
      projection
    );

    return result;
  }

  if (type === EXPENSE_TYPE.EXPENSE) {
    const result = {
      group: [],
      content: [],
    };

    const debtAggregation = [
      {
        $match: {
          ...basicMatchQuery,
          type: EXPENSE_TYPE.EXPENSE,
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
    ];

    result.group = await Expense.aggregate(debtAggregation);
    result.content = await Expense.find(
      debtAggregation[0]["$match"],
      projection
    );

    return result;
  }

  if (type === EXPENSE_TYPE.INVESTMENT) {
    const result = {
      content: [],
      group: [],
    };

    const debtAggregation = [
      {
        $match: {
          ...basicMatchQuery,
          type: EXPENSE_TYPE.INVESTMENT,
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
    ];

    result.group = await Expense.aggregate(debtAggregation);
    result.content = await Expense.find(
      debtAggregation[0]["$match"],
      projection
    );

    return result;
  }
}

exports.getExpense = async (req, res, next) => {
  try {
    const startDate = req.query.start || dayjs().startOf("M").toISOString();
    const endDate = req.query.end || dayjs().endOf("D").toISOString();
    const name = req.query.name;

    const basicMatchQuery = {
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
    console.log(req.query, basicMatchQuery);
    const expenses = await getData(req.query.type, basicMatchQuery, req.query);

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    console.log(err);
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
