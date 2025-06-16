
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { TransactionType, TransactionFormData } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, CreditCard, PiggyBank, Plus } from "lucide-react";
import { useState } from "react";

export const QuickActions = () => {
  const [openDialog, setOpenDialog] = useState<TransactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await transactionService.createTransaction(data);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
      
      toast({
        title: "Success",
        description: `${data.type.toLowerCase().replace('_', ' ')} added successfully!`,
      });
      
      setOpenDialog(null);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 dark:hover:border-green-700"
              onClick={() => setOpenDialog(TransactionType.INCOME)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-950 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-green-700 dark:text-green-300">Add Income Entry</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700"
              onClick={() => setOpenDialog(TransactionType.EXPENSE)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-950 p-2 rounded-lg">
                  <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium text-red-700 dark:text-red-300">Log Expense</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-700"
              onClick={() => setOpenDialog(TransactionType.DEBT_GIVEN)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-950 p-2 rounded-lg">
                  <PiggyBank className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium text-orange-700 dark:text-orange-300">Record Debt Given</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialogs */}
      {openDialog && (
        <TransactionDialog
          open={!!openDialog}
          onOpenChange={(open) => !open && setOpenDialog(null)}
          type={openDialog}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
