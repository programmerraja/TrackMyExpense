
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investmentService";
import { toast } from "@/hooks/use-toast";

export const usePauseInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (investmentId: string) => investmentService.pauseInvestment(investmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Investment Paused",
        description: "Recurring contributions have been paused",
      });
    },
    onError: (error) => {
      console.error("Error pausing investment:", error);
      toast({
        title: "Error",
        description: "Failed to pause investment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useResumeInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (investmentId: string) => investmentService.resumeInvestment(investmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Investment Resumed",
        description: "Recurring contributions have been resumed",
      });
    },
    onError: (error) => {
      console.error("Error resuming investment:", error);
      toast({
        title: "Error",
        description: "Failed to resume investment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useSkipMonth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ investmentId, month }: { investmentId: string; month: string }) => 
      investmentService.addSkippedMonth(investmentId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Month Skipped",
        description: "The selected month has been added to skipped list",
      });
    },
    onError: (error) => {
      console.error("Error skipping month:", error);
      toast({
        title: "Error",
        description: "Failed to skip month. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveSkip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ investmentId, month }: { investmentId: string; month: string }) => 
      investmentService.removeSkippedMonth(investmentId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Skip Removed",
        description: "The month has been removed from skipped list",
      });
    },
    onError: (error) => {
      console.error("Error removing skip:", error);
      toast({
        title: "Error",
        description: "Failed to remove skip. Please try again.",
        variant: "destructive",
      });
    },
  });
};
