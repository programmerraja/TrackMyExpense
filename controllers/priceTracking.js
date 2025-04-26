const axios = require("axios");
const cheerio = require("cheerio");
const User = require("../models/user");
// TODO STORE THIS IN DB AND UI ADD OPTION TO ADD

const MUTUALFUNDS = {
  QUANT_FLEXI: 120843,
  NIPPON_SMALL: 118778,
};

const STOCKS = {
  KARNATAKA_BANK_177_30: "KTKBANK",
  MOIL_367_35: "MOIL",
  PVRINOX_1328_2: "PVRINOX",
  NBCC_89: "NBCC",
  SOUTHBANK_26_80: "SOUTHBANK",
  SUZLON_wait_55: "SUZLON",
  VEDL_WAIT_400to405: "VEDL",
};

const buildMutualFundUrl = (id) =>
  `https://groww.in/v1/api/data/mf/web/v1/scheme/${id}/graph?benchmark=false&months=1`;

const buildStockUrl = (id) =>
  `https://groww.in/v1/api/charting_service/v2/chart/delayed/exchange/NSE/segment/CASH/${id}/monthly/v2?intervalInMinutes=30&minimal=true`;

const formatMutualFundData = (_, data) => ({
  name: data["folio"]["name"],
  data: data["folio"]["data"],
});

const formatStockData = (name, data) => ({
  name,
  data: data?.candles.map((k) => [k[0] * 1000, k[1]]) || [],
});

const fetchGoldRates = async () => {
  const { data } = await axios.get(
    "https://www.tanishq.co.in/gold-rate.html?lang=en_IN"
  );

  const $ = cheerio.load(data);

  const getArray = (selector) => {
    const rawValue = $(selector).attr("value");
    return rawValue
      .replaceAll("[", "")
      .replaceAll("]", "")
      .split(",")
      .map((k) => k.trim());
  };

  const dates = getArray("#goldRateDates");
  // const rates18 = getArray("#goldRate18KT");
  const rates22 = getArray("#goldRate22KT");
  const rates24 = getArray("#goldRate24KT");

  return dates
    .map((date, index) => ({
      date,
      // gold18KT: parseFloat(rates18[index]),
      gold22KT: parseFloat(rates22[index]),
      gold24KT: parseFloat(rates24[index]),
    }))
    .slice(10);
};

const fetchSilverRates = async () => {
  const { data } = await axios.get(
    "https://www.thehindubusinessline.com/silver-rate-today/Chennai/",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9,ta-IN;q=0.8,ta;q=0.7",
        "cache-control": "no-cache",
        dnt: "1",
        pragma: "no-cache",
        priority: "u=0, i",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
    }
  );
  const $ = cheerio.load(data);
  // Select the third table with the class "table table-balance-sheet"
  const table = $(".table.table-balance-sheet").eq(2);
  const rows = table.find("tbody tr");

  const result = [];

  rows.each((i, row) => {
    const cols = $(row).find("td");
    if (cols.length >= 4) {
      console.log(parseInt($(cols[1]).text().trim().trim().replace("₹", "").replaceAll(",", ""))/10);
      result.push({
        date: $(cols[0]).text().trim(),
        silver1g:
          parseInt(
            $(cols[1]).text().trim().replace("₹", "").replaceAll(",", "")
          ) / 10,
        // silver100g: $(cols[2]).text().trim(),
        // silver1kg: $(cols[3]).clone().children().remove().end().text().trim(), // remove span and just get price
      });
    }
  });

  return result;
};

const fetchCurrencyRates = async () => {
  try {
    const { data } = await axios.get(
      "https://wise.com/rates/history+live?source=INR&target=USD&length=30&resolution=daily&unit=day",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        },
      }
    );

    return data.map((item) => {
      const date = new Date(item.time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Format the flipped rate to show 1 USD = x INR with 2 decimal places
      const flippedRate = item.value > 0 ? (1 / item.value).toFixed(2) : 0;

      return {
        date,
        usdToInr: flippedRate,
        inrToUsd: item.value,
        source: item.source,
        target: item.target,
      };
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return [];
  }
};

const typeStrategy = {
  mutual: {
    items: MUTUALFUNDS,
    buildUrl: buildMutualFundUrl,
    formatData: formatMutualFundData,
    isScraper: false,
  },
  stock: {
    items: STOCKS,
    buildUrl: buildStockUrl,
    formatData: formatStockData,
    isScraper: false,
  },
  gold: {
    isScraper: true,
    fetchData: fetchGoldRates,
  },
  silver: {
    isScraper: true,
    fetchData: fetchSilverRates,
  },
  currency: {
    isScraper: true,
    fetchData: fetchCurrencyRates,
  },
};

const fetchStockData = async (stockItems, buildUrl, formatData) => {
  try {
    const responses = await Promise.all(
      Object.entries(stockItems).map(async ([name, id]) => {
        const { data } = await axios.get(buildUrl(id));
        return formatData(name, data);
      })
    );
    return responses;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
};

// Get all stocks for the current user
exports.getUserStocks = async (req, res) => {
  return res.status(200).json(req.user.stocks || []);
};

// Add a new stock to the user's list
exports.addUserStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, symbol } = req.body;

    if (!name || !symbol) {
      return res
        .status(400)
        .json({ error: "Stock name and symbol are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if stock already exists
    const stockExists = user.stocks.some((stock) => stock.symbol === symbol);
    if (stockExists) {
      return res
        .status(400)
        .json({ error: "Stock already exists in your list" });
    }

    // Add the new stock
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
    user.stocks = user.stocks.filter((stock) => stock.symbol !== symbol);
    await user.save();

    return res.status(200).json(user.stocks);
  } catch (error) {
    console.error("Error removing user stock:", error);
    return res.status(500).json({ error: "Failed to remove stock" });
  }
};

exports.getPriceTracking = async (req, res) => {
  const type = req.query.type;

  const strategy = typeStrategy[type];

  if (!strategy) {
    return res.status(400).json({
      error:
        "Invalid type. Use 'mutual', 'stock', 'gold', 'silver', or 'currency'",
    });
  }

  try {
    if (strategy.isScraper) {
      const scrapedData = await strategy.fetchData();
      return res.status(200).json(scrapedData);
    }

    const { items, buildUrl, formatData } = strategy;

    if (type === "stock" && req.user && req.user.id) {
      if (req.user && req.user.stocks && req.user.stocks.length > 0) {
        const combinedStockItems = { ...items };

        req.user.stocks.forEach((stock) => {
          combinedStockItems[stock.name] = stock.symbol;
        });

        const allStockResponses = await fetchStockData(
          combinedStockItems,
          buildUrl,
          formatData
        );
        return res.status(200).json(allStockResponses);
      }
    }

    const responses = await fetchStockData(items, buildUrl, formatData);
    return res.status(200).json(responses);
  } catch (error) {
    console.error(`[${type.toUpperCase()}] Fetch error:`, error);
    return res.status(500).json({ error: "Failed to fetch price data" });
  }
};
