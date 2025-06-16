
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { InvestmentWithSummary, InterestRateType } from "@/types/investment";
import { formatPercentage } from "@/lib/formatters";

interface RateHistoryEntry {
  date: string;
  rate: number;
  type: InterestRateType;
}

interface InterestRateHistoryProps {
  investment: InvestmentWithSummary;
  onAddRateChange?: (rate: number, effectiveDate: string) => void;
  isLoading?: boolean;
}

export const InterestRateHistory = ({ 
  investment, 
  onAddRateChange,
  isLoading 
}: InterestRateHistoryProps) => {
  const [showAddRate, setShowAddRate] = useState(false);
  const [newRate, setNewRate] = useState(investment.interest_rate || 0);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  if (!investment.is_recurring || !investment.interest_rate) {
    return null;
  }

  // Mock historical data - in real implementation, this would come from the database
  const rateHistory: RateHistoryEntry[] = [
    {
      date: investment.start_date || investment.created_at,
      rate: investment.interest_rate,
      type: investment.interest_rate_type || InterestRateType.FIXED
    }
  ];

  const handleAddRate = () => {
    if (onAddRateChange) {
      onAddRateChange(newRate, effectiveDate);
      setShowAddRate(false);
      setNewRate(investment.interest_rate || 0);
      setEffectiveDate(new Date().toISOString().split('T')[0]);
    }
  };

  const getRateChangeIcon = (currentRate: number, previousRate?: number) => {
    if (!previousRate) return null;
    return currentRate > previousRate ? 
      <TrendingUp className="h-3 w-3 text-green-600" /> : 
      <TrendingDown className="h-3 w-3 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Interest Rate History</CardTitle>
          {investment.interest_rate_type === InterestRateType.VARIABLE && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAddRate(!showAddRate)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Update Rate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Rate:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPercentage(investment.interest_rate)}</span>
            <Badge variant={investment.interest_rate_type === InterestRateType.FIXED ? "default" : "secondary"}>
              {investment.interest_rate_type || 'Fixed'}
            </Badge>
          </div>
        </div>

        {showAddRate && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-rate" className="text-xs">New Rate (%)</Label>
                <Input
                  id="new-rate"
                  type="number"
                  step="0.01"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="effective-date" className="text-xs">Effective Date</Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddRate} disabled={isLoading} className="text-xs">
                Add Rate Change
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddRate(false)} className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Rate History:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {rateHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  {getRateChangeIcon(entry.rate, rateHistory[index + 1]?.rate)}
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPercentage(entry.rate)}</span>
                  <Badge variant="outline" className="text-xs">
                    {entry.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
