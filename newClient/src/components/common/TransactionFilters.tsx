
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { Category } from "@/types/category";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategories: Category[];
  onCategoryToggle: (category: Category) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  availableCategories: Category[];
  itemType: string;
}

export const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  availableCategories,
  itemType,
}: TransactionFiltersProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  
  const hasActiveFilters = searchTerm || selectedCategories.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search ${itemType}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="flex gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-border bg-background hover:bg-accent">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem] h-5">
                    {selectedCategories.length + (searchTerm ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover border-border">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-popover-foreground">Categories</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableCategories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.some(c => c.id === category.id)}
                          onChange={() => onCategoryToggle(category)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-popover-foreground">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[130px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="event_date" className="text-popover-foreground hover:bg-accent">Date</SelectItem>
              <SelectItem value="amount" className="text-popover-foreground hover:bg-accent">Amount</SelectItem>
              <SelectItem value="name" className="text-popover-foreground hover:bg-accent">Name</SelectItem>
              <SelectItem value="category" className="text-popover-foreground hover:bg-accent">Category</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border-border bg-background hover:bg-accent"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex items-center gap-2 border-border bg-background hover:bg-accent"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="flex items-center gap-1 bg-secondary hover:bg-secondary/80"
            >
              {category.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onCategoryToggle(category)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
