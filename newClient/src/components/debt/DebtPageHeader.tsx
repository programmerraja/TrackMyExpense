
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface DebtPageHeaderProps {
  onAddDebt: () => void;
}

export const DebtPageHeader = ({ onAddDebt }: DebtPageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-foreground">
          Debt Tracker
        </h2>
        <p className="text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          Track money lent to friends and family
        </p>
      </div>
      <Button 
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        onClick={onAddDebt}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Debt Entry
      </Button>
    </div>
  );
};
