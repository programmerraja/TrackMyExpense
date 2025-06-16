
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investmentService";
import { ContributionHistory } from "@/types/investment";
import { toast } from "@/hooks/use-toast";

export const useUpdateContributionHistory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ investmentId, contributionHistory }: { 
      investmentId: string; 
      contributionHistory: ContributionHistory[] 
    }) => investmentService.updateContributionHistory(investmentId, contributionHistory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Contribution history updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating contribution history:", error);
      toast({
        title: "Error",
        description: "Failed to update contribution history. Please try again.",
        variant: "destructive",
      });
    },
  });
};
