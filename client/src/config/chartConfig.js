
export const DEFAULT_COLORS = [
  { borderColor: "#FFD700", backgroundColor: "rgba(255, 215, 0, 0.2)" },  // Gold
  { borderColor: "#DAA520", backgroundColor: "rgba(218, 165, 32, 0.2)" },  // Golden Rod
  { borderColor: "#C0C0C0", backgroundColor: "rgba(192, 192, 192, 0.2)" }, // Silver
  { borderColor: "#36A2EB", backgroundColor: "rgba(54, 162, 235, 0.2)" },  // Blue
  { borderColor: "#FF6384", backgroundColor: "rgba(255, 99, 132, 0.2)" },  // Red
  { borderColor: "#4BC0C0", backgroundColor: "rgba(75, 192, 192, 0.2)" },  // Teal
  { borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.2)" },   // Green
  { borderColor: "#9966FF", backgroundColor: "rgba(153, 102, 255, 0.2)" }, // Purple
  { borderColor: "#FF9F40", backgroundColor: "rgba(255, 159, 64, 0.2)" },  // Orange
];

/**
 * Chart configurations for different data types
 *
 * Each configuration object should have:
 * - title: The title to display on the chart
 * - fields: Array of field names from the data to display as datasets
 * - colors: Array of color objects for each dataset (optional, will use DEFAULT_COLORS if not provided)
 * - yAxisLabel: Label for the Y-axis
 * - labels: Field name to use for X-axis labels (optional, defaults to "date")
 */
export const CHART_CONFIGS = {
  gold: {
    title: "Gold Rate Chart",
    fields: ["gold22KT", "gold24KT"],
    colors: [
      { borderColor: "#FFD700", backgroundColor: "rgba(255, 215, 0, 0.2)" },
      { borderColor: "#DAA520", backgroundColor: "rgba(218, 165, 32, 0.2)" }
    ],
    yAxisLabel: "Price (₹)"
  },
  silver: {
    title: "Silver Rate Chart",
    fields: ["silver10g", "silver100g"],
    colors: [
      { borderColor: "#C0C0C0", backgroundColor: "rgba(192, 192, 192, 0.2)" },
      { borderColor: "#A9A9A9", backgroundColor: "rgba(169, 169, 169, 0.2)" },
    ],
    yAxisLabel: "Price (₹)"
  },
  currency: {
    title: "USD to INR Exchange Rate",
    fields: ["usdToInr"],
    colors: [
      { borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.2)" },
    ],
    yAxisLabel: "1 USD = ₹",
    // Custom field labels for better readability in tooltips
    fieldLabels: {
      "usdToInr": "1 USD = ₹"
    }
  }
};


export const DATA_TYPES = ["gold", "silver", "mutual", "stock", "currency"];
