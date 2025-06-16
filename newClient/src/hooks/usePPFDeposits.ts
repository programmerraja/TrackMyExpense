
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investmentService";
import { toast } from "@/hooks/use-toast";

export const usePPFDeposits = () => {
  const queryClient = useQueryClient();

  const updateDeposit = useMutation({
    mutationFn: ({ investmentId, month, amount, date }: {
      investmentId: string;
      month: string;
      amount: number;
      date: string;
    }) => investmentService.updatePPFDeposit(investmentId, month, amount, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "PPF deposit updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating PPF deposit:", error);
      toast({
        title: "Error",
        description: "Failed to update PPF deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeDeposit = useMutation({
    mutationFn: ({ investmentId, month }: {
      investmentId: string;
      month: string;
    }) => investmentService.removePPFDeposit(investmentId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "PPF deposit removed successfully!",
      });
    },
    onError: (error) => {
      console.error("Error removing PPF deposit:", error);
      toast({
        title: "Error",
        description: "Failed to remove PPF deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enableRecurring = useMutation({
    mutationFn: ({ investmentId, amount, startMonth }: {
      investmentId: string;
      amount: number;
      startMonth: string;
    }) => investmentService.enablePPFRecurringDeposits(investmentId, amount, startMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Recurring deposits enabled successfully!",
      });
    },
    onError: (error) => {
      console.error("Error enabling recurring deposits:", error);
      toast({
        title: "Error",
        description: "Failed to enable recurring deposits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRecurringAmount = useMutation({
    mutationFn: ({ investmentId, newAmount, effectiveFromMonth }: {
      investmentId: string;
      newAmount: number;
      effectiveFromMonth: string;
    }) => investmentService.updatePPFRecurringAmount(investmentId, newAmount, effectiveFromMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Recurring amount updated successfully!",
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

  const disableRecurring = useMutation({
    mutationFn: ({ investmentId }: {
      investmentId: string;
    }) => investmentService.disablePPFRecurringDeposits(investmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Recurring deposits disabled successfully!",
      });
    },
    onError: (error) => {
      console.error("Error disabling recurring deposits:", error);
      toast({
        title: "Error",
        description: "Failed to disable recurring deposits. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    updateDeposit,
    removeDeposit,
    enableRecurring,
    updateRecurringAmount,
    disableRecurring,
    isUpdating: updateDeposit.isPending,
    isRemoving: removeDeposit.isPending,
    isEnabling: enableRecurring.isPending,
    isUpdatingAmount: updateRecurringAmount.isPending,
    isDisabling: disableRecurring.isPending
  };
};
