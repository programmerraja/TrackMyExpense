
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";

interface ExpensePageHeaderProps {
  onAddExpense: () => void;
}

export const ExpensePageHeader = ({ onAddExpense }: ExpensePageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-foreground">
          Expense Tracker
        </h2>
        <p className="text-muted-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-red-500 dark:text-red-400" />
          Monitor your expenses and tax payments
        </p>
      </div>
      <Button 
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        onClick={onAddExpense}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Expense
      </Button>
    </div>
  );
};
