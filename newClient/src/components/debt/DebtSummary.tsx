
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle, MinusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DebtSummaryProps {
  totalLent: number;
  totalBorrowed: number;
  netPosition: number;
}

export const DebtSummary = ({ totalLent, totalBorrowed, netPosition }: DebtSummaryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Total Lent (Outstanding)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalLent)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Total Borrowed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalBorrowed)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
            Net Debt Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netPosition)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
