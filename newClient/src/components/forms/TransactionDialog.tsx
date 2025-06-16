import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { TransactionType, TransactionFormData, Transaction } from "@/types/transaction";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
  initialData?: Transaction;
}

export const TransactionDialog = ({ open, onOpenChange, type, onSubmit, isLoading, initialData }: TransactionDialogProps) => {
  const getTitle = (transactionType: TransactionType) => {
    const action = initialData ? "Edit" : "Add";
    switch (transactionType) {
      case TransactionType.INCOME:
        return `${action} Income`;
      case TransactionType.EXPENSE:
        return `${action} Expense`;
      case TransactionType.DEBT_GIVEN:
      case TransactionType.DEBT_BOUGHT:
        return `${action} Debt Entry`;
      case TransactionType.INCOME_TAX:
        return `${action} Tax Payment`;
      default:
        return `${action} Transaction`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle(type)}</DialogTitle>
        </DialogHeader>
        <TransactionForm
          type={type}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};
