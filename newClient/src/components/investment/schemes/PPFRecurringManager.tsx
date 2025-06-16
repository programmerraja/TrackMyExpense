
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface PPFRecurringManagerProps {
  recurringConfig: {
    enabled: boolean;
    amount: number;
    start_month: string | null;
  } | null;
  onEnableRecurring: (amount: number, startMonth: string) => void;
  onUpdateRecurringAmount: (newAmount: number, effectiveFromMonth: string) => void;
  onDisableRecurring: () => void;
  isLoading?: boolean;
}

export const PPFRecurringManager = ({
  recurringConfig,
  onEnableRecurring,
  onUpdateRecurringAmount,
  onDisableRecurring,
  isLoading = false
}: PPFRecurringManagerProps) => {
  const [recurringAmount, setRecurringAmount] = useState(
    recurringConfig?.amount || 12500
  );
  const [startMonth, setStartMonth] = useState(
    () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().substring(0, 7);
    }
  );
  const [effectiveFromMonth, setEffectiveFromMonth] = useState(
    () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().substring(0, 7);
    }
  );

  const isRecurringEnabled = recurringConfig?.enabled || false;

  const handleToggleRecurring = () => {
    if (isRecurringEnabled) {
      onDisableRecurring();
    } else {
      if (recurringAmount > 0) {
        onEnableRecurring(recurringAmount, startMonth);
      }
    }
  };

  const handleUpdateAmount = () => {
    if (recurringAmount > 0 && isRecurringEnabled) {
      onUpdateRecurringAmount(recurringAmount, effectiveFromMonth);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Recurring Deposits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="recurring-toggle">Enable Recurring Deposits</Label>
            <p className="text-sm text-muted-foreground">
              Automatically add the same amount every month
            </p>
          </div>
          <Switch
            id="recurring-toggle"
            checked={isRecurringEnabled}
            onCheckedChange={handleToggleRecurring}
            disabled={isLoading}
          />
        </div>

        {isRecurringEnabled && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <span className="text-sm font-medium">
                {formatCurrency(recurringConfig?.amount || 0)} per month
              </span>
              {recurringConfig?.start_month && (
                <span className="text-xs text-muted-foreground">
                  since {recurringConfig.start_month}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="new-recurring-amount">Update Amount (₹)</Label>
                <Input
                  id="new-recurring-amount"
                  type="number"
                  value={recurringAmount}
                  onChange={(e) => setRecurringAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="effective-from">Effective From</Label>
                <Input
                  id="effective-from"
                  type="month"
                  value={effectiveFromMonth}
                  onChange={(e) => setEffectiveFromMonth(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleUpdateAmount}
                disabled={isLoading || recurringAmount === recurringConfig?.amount}
                size="sm"
                className="w-full"
              >
                {isLoading ? "Updating..." : "Update Recurring Amount"}
              </Button>
            </div>
          </div>
        )}

        {!isRecurringEnabled && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="initial-amount">Monthly Amount (₹)</Label>
              <Input
                id="initial-amount"
                type="number"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(parseFloat(e.target.value) || 0)}
                placeholder="12500"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="start-month">Start From</Label>
              <Input
                id="start-month"
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleToggleRecurring}
              disabled={isLoading || recurringAmount <= 0}
              size="sm"
              className="w-full"
            >
              {isLoading ? "Setting up..." : "Enable Recurring Deposits"}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-gray-50 dark:bg-gray-900 rounded">
          <p>• Recurring deposits will be auto-generated for future months</p>
          <p>• You can still manually edit or skip individual months</p>
          <p>• Manual changes won't be overwritten by recurring updates</p>
        </div>
      </CardContent>
    </Card>
  );
};
