
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import { InvestmentWithSummary, ContributionHistory } from "@/types/investment";
import { formatCurrency } from "@/lib/formatters";

interface ContributionHistoryManagerProps {
  investment: InvestmentWithSummary;
  onUpdateContributionHistory: (investmentId: string, history: ContributionHistory[]) => void;
  isLoading?: boolean;
}

export const ContributionHistoryManager = ({
  investment,
  onUpdateContributionHistory,
  isLoading = false,
}: ContributionHistoryManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    reason: "",
  });

  const contributionHistory = investment.contribution_history || [];

  const handleAddContribution = () => {
    if (!formData.date || !formData.amount) return;

    const newContribution: ContributionHistory = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      reason: formData.reason || undefined,
    };

    const updatedHistory = editingIndex !== null
      ? contributionHistory.map((item, index) => 
          index === editingIndex ? newContribution : item
        )
      : [...contributionHistory, newContribution];

    // Sort by date
    updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    onUpdateContributionHistory(investment.id, updatedHistory);
    
    setFormData({ date: "", amount: "", reason: "" });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const contribution = contributionHistory[index];
    setFormData({
      date: contribution.date,
      amount: contribution.amount.toString(),
      reason: contribution.reason || "",
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (index: number) => {
    const updatedHistory = contributionHistory.filter((_, i) => i !== index);
    onUpdateContributionHistory(investment.id, updatedHistory);
  };

  const handleCancel = () => {
    setFormData({ date: "", amount: "", reason: "" });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  if (!investment.is_recurring) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Contribution History
          </div>
          {!showAddForm && (
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Add Custom Amount
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contribution-date" className="text-xs">Date</Label>
                  <Input
                    id="contribution-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contribution-amount" className="text-xs">Amount (₹)</Label>
                  <Input
                    id="contribution-amount"
                    type="number"
                    step="1"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="text-sm"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contribution-reason" className="text-xs">Reason (Optional)</Label>
                <Textarea
                  id="contribution-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="text-sm min-h-[60px]"
                  placeholder="e.g., Bonus, salary hike, reduced income..."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddContribution} disabled={isLoading}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {contributionHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom contributions added. Using recurring amount of {formatCurrency(investment.recurring_amount || 0)}.
            </p>
          ) : (
            contributionHistory.map((contribution, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {new Date(contribution.date).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(contribution.amount)}
                    </Badge>
                  </div>
                  {contribution.reason && (
                    <p className="text-xs text-muted-foreground">{contribution.reason}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => handleEdit(index)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
