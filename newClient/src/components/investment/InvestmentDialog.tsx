
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvestmentForm } from "./InvestmentForm";
import { InvestmentFormData, InvestmentPurpose, Investment } from "@/types/investment";

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purpose: InvestmentPurpose;
  onSubmit: (data: InvestmentFormData) => void;
  isLoading?: boolean;
  investmentToEdit?: Investment;
}

export const InvestmentDialog = ({ 
  open, 
  onOpenChange, 
  purpose, 
  onSubmit, 
  isLoading,
  investmentToEdit
}: InvestmentDialogProps) => {
  const isEditing = !!investmentToEdit;

  const getTitle = () => {
    if (isEditing) return "Edit Investment";
    return purpose === InvestmentPurpose.OWNED ? "Add Investment" : "Add to Watchlist";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <InvestmentForm
          purpose={investmentToEdit?.purpose || purpose}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          isEditing={isEditing}
          initialData={investmentToEdit}
        />
      </DialogContent>
    </Dialog>
  );
};
