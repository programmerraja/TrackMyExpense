
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Category } from "@/types/category";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryManagerProps {
  type: 'INCOME' | 'EXPENSE' | 'DEBT' | 'TAX' | 'INVESTMENT';
}

export const CategoryManager = ({ type }: CategoryManagerProps) => {
  const { user } = useAuth();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoryService.getCategories(type)
  });

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="rounded-md border">
      <div className="p-4 space-y-2">
        {categories?.map((category: Category) => (
          <div key={category.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span>{category.name}</span>
            {category.user_id === user?.id && (
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {categories?.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No categories found.</p>
        )}
      </div>
    </div>
  );
};
