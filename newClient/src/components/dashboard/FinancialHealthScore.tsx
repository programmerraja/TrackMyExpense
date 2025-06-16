
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { TransactionSummary } from "@/types/summary";
import { formatCurrency } from "@/lib/utils";

interface FinancialHealthScoreProps {
  summary: TransactionSummary;
}

export const FinancialHealthScore = ({ summary }: FinancialHealthScoreProps) => {
  const calculateHealthScore = () => {
    if (summary.total_income === 0) return 0;
    
    const savingsRate = (summary.monthly_savings / summary.total_income) * 100;
    const debtRatio = ((summary.total_debt_given + summary.total_debt_bought) / summary.total_income) * 100;
    
    let score = 50; // Base score
    
    // Savings rate scoring (0-40 points)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 5) score += 20;
    else if (savingsRate > 0) score += 10;
    
    // Debt ratio scoring (0-30 points)
    if (debtRatio <= 10) score += 30;
    else if (debtRatio <= 20) score += 20;
    else if (debtRatio <= 30) score += 10;
    
    // Income vs expenses (0-30 points)
    if (summary.monthly_savings > 0) score += 30;
    else if (summary.monthly_savings === 0) score += 15;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600 dark:text-green-400", icon: CheckCircle };
    if (score >= 60) return { label: "Good", color: "text-blue-600 dark:text-blue-400", icon: TrendingUp };
    if (score >= 40) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", icon: Target };
    return { label: "Needs Attention", color: "text-red-600 dark:text-red-400", icon: AlertTriangle };
  };

  const score = calculateHealthScore();
  const status = getHealthStatus(score);
  const StatusIcon = status.icon;
  
  const savingsRate = summary.total_income > 0 ? (summary.monthly_savings / summary.total_income) * 100 : 0;
  const expenseRatio = summary.total_income > 0 ? (summary.total_expenses / summary.total_income) * 100 : 0;

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Health Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2.51 * score} 251`}
                  className={status.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${status.color}`}>{Math.round(score)}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className={`font-semibold ${status.color}`}>{status.label}</p>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-foreground">Savings Rate:</span>
              <span className={`font-bold ${savingsRate >= 10 ? 'text-green-600 dark:text-green-400' : savingsRate >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-foreground">Expense Ratio:</span>
              <span className={`font-bold ${expenseRatio <= 70 ? 'text-green-600 dark:text-green-400' : expenseRatio <= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {expenseRatio.toFixed(1)}%
              </span>
            </div>

            {(summary.total_debt_given > 0 || summary.total_debt_bought > 0) && (
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">Outstanding Debt:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(Number(summary.total_debt_given + summary.total_debt_bought))}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
