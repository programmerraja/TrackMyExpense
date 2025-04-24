const axios = require("axios");
const cheerio = require("cheerio");
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
};

exports.getPriceTracking = async (req, res) => {
  const type = req.query.type;

  const strategy = typeStrategy[type];

  if (!strategy) {
    return res
      .status(400)
      .json({ error: "Invalid type. Use 'mutual', 'stock', or 'gold'" });
  }

  try {
    if (strategy.isScraper) {
      const goldRates = await strategy.fetchData();
      return res.status(200).json(goldRates);
    }

    const { items, buildUrl, formatData } = strategy;

    const responses = await Promise.all(
      Object.entries(items).map(async ([name, id]) => {
        const { data } = await axios.get(buildUrl(id));
        return formatData(name, data);
      })
    );

    return res.status(200).json(responses);
  } catch (error) {
    console.error(`[${type.toUpperCase()}] Fetch error:`, error.message);
    return res.status(500).json({ error: "Failed to fetch price data" });
  }
};
