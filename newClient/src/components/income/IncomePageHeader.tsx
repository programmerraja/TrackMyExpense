
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";

interface IncomePageHeaderProps {
  onAddIncome: () => void;
}

export const IncomePageHeader = ({ onAddIncome }: IncomePageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-foreground">
          Income Tracker
        </h2>
        <p className="text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          Track your monthly income by category
        </p>
      </div>
      <Button 
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        onClick={onAddIncome}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Income
      </Button>
    </div>
  );
};
