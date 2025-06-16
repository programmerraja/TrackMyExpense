
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, Wallet, PiggyBank, CreditCard, Target } from "lucide-react";
import { DateFilter } from "@/components/common/DateFilter";
import { useState } from "react";
import { useTransactionSummary } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { FinancialHealthScore } from "./FinancialHealthScore";
import { QuickActions } from "./QuickActions";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSummary = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: summaryData, isLoading, error } = useTransactionSummary(startDate, endDate);

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    console.log("Dashboard date filter changed:", { start, end });
  };

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else if (startDate) {
      return `From ${startDate.toLocaleDateString()}`;
    } else if (endDate) {
      return `Until ${endDate.toLocaleDateString()}`;
    }
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  const summary = summaryData || {
    total_income: 0,
    total_expenses: 0,
    total_taxes: 0,
    total_debt_given: 0,
    total_debt_bought: 0,
    monthly_savings: 0,
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground">
            Financial Overview
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            {getDateRangeText()}
          </p>
        </div>
      </div>

      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <DateFilter onDateRangeChange={handleDateRangeChange} />
        </CardContent>
      </Card>
      
      {isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
             <Skeleton className="h-64 w-full rounded-lg" />
             <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(summary.total_income))}
                </div>
                {summary.total_income > 0 && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Income tracked
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                  <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(summary.total_expenses))}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Taxes: {formatCurrency(Number(summary.total_taxes))}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Savings</CardTitle>
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(summary.monthly_savings))}
                </div>
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  Number(summary.monthly_savings) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {Number(summary.monthly_savings) >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Number(summary.monthly_savings) >= 0 ? 'Positive savings!' : 'Spending more than earning'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Debts</CardTitle>
                <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Wallet className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(summary.total_debt_given))}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Money lent to others
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FinancialHealthScore summary={summary} />
            <QuickActions />
          </div>
        </>
      )}
    </div>
  );
};
