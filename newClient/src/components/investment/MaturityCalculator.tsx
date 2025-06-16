
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp } from "lucide-react";
import { InvestmentWithSummary } from "@/types/investment";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { InvestmentCalculationEngine } from "@/services/calculationEngine";

interface MaturityCalculatorProps {
  investment: InvestmentWithSummary;
}

export const MaturityCalculator = ({ investment }: MaturityCalculatorProps) => {
  const [projectionYears, setProjectionYears] = useState(
    investment.maturity_date ? 
    Math.ceil((new Date(investment.maturity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
    10
  );
  const [customInterestRate, setCustomInterestRate] = useState(investment.interest_rate || 7.5);

  if (!investment.is_recurring) {
    return null;
  }

  const calculateProjection = () => {
    const projectionInvestment = {
      ...investment,
      interest_rate: customInterestRate,
      maturity_date: new Date(Date.now() + projectionYears * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    return InvestmentCalculationEngine.calculateRecurringInvestment(projectionInvestment);
  };

  const projection = calculateProjection();
  const currentValue = investment.summary.currentValue;
  const projectedGrowth = projection ? (projection.projectedMaturityValue || 0) - currentValue : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="h-4 w-4" />
          Maturity Projection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="years" className="text-xs">Years to Project</Label>
            <Input
              id="years"
              type="number"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              className="text-sm"
              min="1"
              max="50"
            />
          </div>
          <div>
            <Label htmlFor="rate" className="text-xs">Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={customInterestRate}
              onChange={(e) => setCustomInterestRate(Number(e.target.value))}
              className="text-sm"
              min="0"
              max="20"
            />
          </div>
        </div>

        {projection && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Current Value</p>
                <p className="font-semibold">{formatCurrency(currentValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Contributions</p>
                <p className="font-semibold">{formatCurrency(projection.totalRecurringContributions || 0)}</p>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Projected Maturity Value
                </p>
              </div>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(projection.projectedMaturityValue || 0)}
              </p>
              <p className="text-xs text-green-600">
                Growth: {formatCurrency(projectedGrowth)} 
                ({formatPercentage(currentValue > 0 ? (projectedGrowth / currentValue) * 100 : 0)})
              </p>
            </div>

            {investment.maturity_date && (
              <div className="text-xs text-muted-foreground">
                <p>Maturity Date: {new Date(investment.maturity_date).toLocaleDateString()}</p>
                <p>Years Remaining: {(projection.yearsToMaturity || 0).toFixed(1)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
