
import { formatCurrency } from "@/lib/utils";

interface PortfolioSummaryProps {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalInvestments: number;
  realTimeCurrentValue?: number;
  realTimeTotalProfitLoss?: number;
}

export const PortfolioSummary = ({ 
  totalInvested, 
  currentValue, 
  totalProfitLoss, 
  totalInvestments,
  realTimeCurrentValue,
  realTimeTotalProfitLoss 
}: PortfolioSummaryProps) => {
  if (totalInvestments === 0) return null;
  
  // Use real-time values if available, otherwise fall back to static values
  const displayCurrentValue = realTimeCurrentValue ?? currentValue;
  const displayProfitLoss = realTimeTotalProfitLoss ?? totalProfitLoss;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-600">Total Invested</p>
        <p className="text-2xl font-bold text-blue-900">
          {formatCurrency(totalInvested)}
        </p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-600">Current Value</p>
        <p className="text-2xl font-bold text-green-900">
          {formatCurrency(displayCurrentValue)}
        </p>
        {realTimeCurrentValue && (
          <p className="text-xs text-green-600 mt-1">Live</p>
        )}
      </div>
      <div className={`p-4 rounded-lg border ${
        displayProfitLoss >= 0 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <p className={`text-sm font-medium ${
          displayProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          Total {displayProfitLoss >= 0 ? 'Profit' : 'Loss'}
        </p>
        <p className={`text-2xl font-bold ${
          displayProfitLoss >= 0 ? 'text-emerald-900' : 'text-red-900'
        }`}>
          {formatCurrency(Math.abs(displayProfitLoss))}
        </p>
        {realTimeTotalProfitLoss !== undefined && (
          <p className={`text-xs mt-1 ${
            displayProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            Live
          </p>
        )}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Investments</p>
        <p className="text-2xl font-bold text-gray-900">
          {totalInvestments}
        </p>
      </div>
    </div>
  );
};
