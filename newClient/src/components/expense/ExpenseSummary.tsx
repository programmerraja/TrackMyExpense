
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ExpenseSummaryProps {
  totalExpenses: number;
  averageExpense: number;
}

export const ExpenseSummary = ({ totalExpenses, averageExpense }: ExpenseSummaryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalExpenses)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            Average Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(averageExpense)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
