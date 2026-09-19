const BankMapping = require("../models/bankMapping");
const { normalizeNarration } = require("../utils/bankImport");

const GRANULARITIES = ["month", "payee", "transaction"];

const ALLOWED_TYPES = [
  "EXPENSE",
  "INCOME",
  "INCOME_TAX",
  "DEBT_GIVEN",
  "DEBT_BOUGHT",
  "SKIP",
];

exports.list = async (req, res) => {
  try {
    const mappings = await BankMapping.find({
      userId: String(req.user._id),
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: mappings });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.upsert = async (req, res) => {
  try {
    const matchText = normalizeNarration(req.body.matchText);
    const { direction, type } = req.body;
    if (
      !matchText ||
      !["debit", "credit"].includes(direction) ||
      !ALLOWED_TYPES.includes(type)
    ) {
      return res.status(400).json({
        success: false,
        error: "Match text, direction and destination are required",
      });
    }

    const mapping = await BankMapping.findOneAndUpdate(
      {
        userId: String(req.user._id),
        matchText,
        direction,
      },
      {
        type,
        name: (req.body.name || "").trim().toLowerCase(),
        category: (req.body.category || "other").trim().toLowerCase(),
        granularity: GRANULARITIES.includes(req.body.granularity)
          ? req.body.granularity
          : "month",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(200).json({ success: true, data: mapping });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    await BankMapping.deleteOne({
      _id: req.params.id,
      userId: String(req.user._id),
    });
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};
