
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investmentService";
import { toast } from "@/hooks/use-toast";

export const useUpdateRecurringAmount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      investmentId, 
      newAmount, 
      effectiveDate, 
      reason 
    }: { 
      investmentId: string; 
      newAmount: number; 
      effectiveDate: string; 
      reason?: string; 
    }) => investmentService.updateRecurringAmount(investmentId, newAmount, effectiveDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Amount Updated",
        description: "Recurring investment amount has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating recurring amount:", error);
      toast({
        title: "Error",
        description: "Failed to update recurring amount. Please try again.",
        variant: "destructive",
      });
    },
  });
};
