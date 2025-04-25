const User = require("../models/user");

exports.getUserStocks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.status(200).json(user.stocks || []);
  } catch (error) {
    console.error("Error fetching user stocks:", error);
    return res.status(500).json({ error: "Failed to fetch user stocks" });
  }
};

exports.addUserStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, symbol } = req.body;
    
    // Validate input
    if (!name || !symbol) {
      return res.status(400).json({ error: "Stock name and symbol are required" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if stock already exists
    const stockExists = user.stocks.some(stock => stock.symbol === symbol);
    if (stockExists) {
      return res.status(400).json({ error: "Stock already exists in your list" });
    }
    
    user.stocks.push({ name, symbol });
    await user.save();
    
    return res.status(201).json(user.stocks);
  } catch (error) {
    console.error("Error adding user stock:", error);
    return res.status(500).json({ error: "Failed to add stock" });
  }
};

// Remove a stock from the user's list
exports.removeUserStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol is required" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Remove the stock
    user.stocks = user.stocks.filter(stock => stock.symbol !== symbol);
    await user.save();
    
    return res.status(200).json(user.stocks);
  } catch (error) {
    console.error("Error removing user stock:", error);
    return res.status(500).json({ error: "Failed to remove stock" });
  }
};
