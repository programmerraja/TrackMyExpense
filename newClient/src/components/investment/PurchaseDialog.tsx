
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PurchaseForm } from "./PurchaseForm";
import { Purchase } from "@/types/investment";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentName: string;
  onSubmit: (purchase: Omit<Purchase, 'total_amount'>) => void;
  isLoading?: boolean;
}

export const PurchaseDialog = ({ 
  open, 
  onOpenChange, 
  investmentName, 
  onSubmit, 
  isLoading 
}: PurchaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Purchase - {investmentName}</DialogTitle>
        </DialogHeader>
        <PurchaseForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
