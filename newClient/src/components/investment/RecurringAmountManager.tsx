
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit3, History, TrendingUp } from "lucide-react";
import { Investment } from "@/types/investment";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "@/hooks/use-toast";

interface RecurringAmountManagerProps {
  investment: Investment;
  onUpdateAmount: (investmentId: string, newAmount: number, effectiveDate: string, reason?: string) => void;
  isLoading?: boolean;
}

export const RecurringAmountManager = ({
  investment,
  onUpdateAmount,
  isLoading
}: RecurringAmountManagerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [newAmount, setNewAmount] = useState(investment.recurring_amount || 0);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [changeReason, setChangeReason] = useState("");

  if (!investment.is_recurring) return null;

  const handleUpdateAmount = () => {
    if (!newAmount || newAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (newAmount === investment.recurring_amount) {
      toast({
        title: "Same Amount",
        description: "The new amount is same as current amount",
        variant: "destructive",
      });
      return;
    }

    onUpdateAmount(investment.id, newAmount, effectiveDate, changeReason);
    setShowDialog(false);
    setChangeReason("");
  };

  const predefinedReasons = [
    "Salary increment",
    "Bonus investment",
    "Reduced financial capacity",
    "Tax planning adjustment",
    "Annual review",
    "Other"
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Current: {formatCurrency(investment.recurring_amount || 0)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            per {investment.recurring_frequency?.toLowerCase()}
          </span>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Change Amount
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Update Recurring Amount
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium">{investment.name}</div>
                <div className="text-xs text-muted-foreground">
                  Current: {formatCurrency(investment.recurring_amount || 0)} per {investment.recurring_frequency?.toLowerCase()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-amount">New Amount (₹)</Label>
                <Input
                  id="new-amount"
                  type="number"
                  step="1"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter new amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective-date">Effective From</Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change</Label>
                <Select value={changeReason} onValueChange={setChangeReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newAmount !== investment.recurring_amount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    Change Summary
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {newAmount > (investment.recurring_amount || 0) ? "Increase" : "Decrease"} of{" "}
                    {formatCurrency(Math.abs(newAmount - (investment.recurring_amount || 0)))}
                    {" "}({((Math.abs(newAmount - (investment.recurring_amount || 0)) / (investment.recurring_amount || 1)) * 100).toFixed(1)}%)
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateAmount}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Amount"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
