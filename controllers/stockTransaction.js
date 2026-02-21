const StockTransaction = require("../models/stockTransaction");
const User = require("../models/user");

// Add a new trade (Buy/Sell)
exports.addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, name, type, quantity, price, date, note } = req.body;

    if (!symbol || !name || !type || !quantity || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = new StockTransaction({
      userId,
      symbol: symbol.toUpperCase(),
      name,
      type,
      quantity,
      price,
      date: date || new Date(),
      note,
    });

    await transaction.save();

    // Ensure stock exists in user watchlist for price tracking
    const user = await User.findById(userId);
    const stockExists = user.stocks.some(
      (s) => s.symbol === symbol.toUpperCase(),
    );
    if (!stockExists) {
      user.stocks.push({ name, symbol: symbol.toUpperCase() });
      await user.save();
    }

    return res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding stock transaction:", error);
    return res.status(500).json({ error: "Failed to add transaction" });
  }
};

// Get all transactions for the current user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await StockTransaction.find({
      userId: req.user.id,
    }).sort({ date: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Get current holdings (aggregated transactions)
exports.getHoldings = async (req, res) => {
  try {
    const transactions = await StockTransaction.find({ userId: req.user.id });

    // Aggregate by symbol
    const holdingsMap = {};

    transactions.forEach((tx) => {
      if (!holdingsMap[tx.symbol]) {
        holdingsMap[tx.symbol] = {
          symbol: tx.symbol,
          name: tx.name,
          quantity: 0,
          totalCost: 0,
          realizedPnL: 0,
        };
      }

      const h = holdingsMap[tx.symbol];
      if (tx.type === "BUY") {
        h.quantity += tx.quantity;
        h.totalCost += tx.quantity * tx.price;
      } else {
        // Simple realized P&L calculation (Selling against avg cost)
        const avgBuyPrice = h.quantity > 0 ? h.totalCost / h.quantity : 0;
        h.realizedPnL += tx.quantity * (tx.price - avgBuyPrice);
        h.quantity -= tx.quantity;
        h.totalCost -= tx.quantity * avgBuyPrice;
      }
    });

    // Convert map to array and add avgPrice
    const holdings = Object.values(holdingsMap)
      .map((h) => ({
        ...h,
        avgPrice: h.quantity > 0 ? h.totalCost / h.quantity : 0,
      }))
      .filter((h) => h.quantity > 0 || h.realizedPnL !== 0);

    return res.status(200).json(holdings);
  } catch (error) {
    console.error("Error calculating holdings:", error);
    return res.status(500).json({ error: "Failed to calculate holdings" });
  }
};
