
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { Button } from "@/components/ui/button";
import { AddCategoryDialog } from "@/components/settings/AddCategoryDialog";
import { categoryService } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/category";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<Category['type']>('INCOME');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addCategoryMutation = useMutation({
    mutationFn: (newCategory: { name: string }) => categoryService.addCategory({ ...newCategory, type: activeTab }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Category added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add category: ${error.message}`,
      });
    },
  });

  const handleAddCategory = (values: { name: string }) => {
    addCategoryMutation.mutate(values);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as Category['type'])} 
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="INCOME">Income Categories</TabsTrigger>
            <TabsTrigger value="EXPENSE">Expense Categories</TabsTrigger>
            <TabsTrigger value="INVESTMENT">Investment Categories</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
          </Button>
        </div>
        <TabsContent value="INCOME" className="space-y-4">
          <CategoryManager type="INCOME" />
        </TabsContent>
        <TabsContent value="EXPENSE" className="space-y-4">
          <CategoryManager type="EXPENSE" />
        </TabsContent>
        <TabsContent value="INVESTMENT" className="space-y-4">
           <CategoryManager type="INVESTMENT" />
        </TabsContent>
      </Tabs>
      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCategory}
        type={activeTab}
        isPending={addCategoryMutation.isPending}
      />
    </div>
  );
};

export default Settings;
