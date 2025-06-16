import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investmentService";
import { InvestmentPurpose, InvestmentFormData, Purchase } from "@/types/investment";
import { toast } from "@/hooks/use-toast";

export const useInvestments = (purpose?: InvestmentPurpose) => {
  return useQuery({
    queryKey: ["investments", purpose],
    queryFn: () => investmentService.getInvestments(purpose),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InvestmentFormData) => investmentService.createInvestment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Investment added successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating investment:", error);
      toast({
        title: "Error",
        description: "Failed to add investment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<InvestmentFormData> }) => 
      investmentService.updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Investment updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating investment:", error);
      toast({
        title: "Error",
        description: "Failed to update investment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useAddPurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ investmentId, purchase }: { 
      investmentId: string; 
      purchase: Omit<Purchase, 'total_amount'> 
    }) => investmentService.addPurchase(investmentId, purchase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Purchase added successfully!",
      });
    },
    onError: (error) => {
      console.error("Error adding purchase:", error);
      toast({
        title: "Error",
        description: "Failed to add purchase. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => investmentService.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast({
        title: "Success",
        description: "Investment deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("Error deleting investment:", error);
      toast({
        title: "Error",
        description: "Failed to delete investment. Please try again.",
        variant: "destructive",
      });
    },
  });
};
