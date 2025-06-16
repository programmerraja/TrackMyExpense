
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, SortAsc, SortDesc, Filter } from "lucide-react";
import { InvestmentType } from "@/types/investment";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvestmentFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTypes: InvestmentType[];
  onTypeToggle: (type: InvestmentType) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export const InvestmentFilters = ({
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeToggle,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: InvestmentFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const investmentTypes = Object.values(InvestmentType);

  const hasActiveFilters = searchTerm || selectedTypes.length > 0;

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute top-full left-0 right-0 z-50 mt-2">
              <div className="bg-card rounded-lg border border-border shadow-lg p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Sort By</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={sortBy} onValueChange={onSortChange}>
                      <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="created_at">Date Added</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="total_invested">Total Invested</SelectItem>
                        <SelectItem value="current_value">Current Value</SelectItem>
                        <SelectItem value="profit_loss">P&L</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Filter by Type</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {investmentTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
                        onClick={() => onTypeToggle(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onClearFilters();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm font-medium text-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1">
          <Label className="text-sm font-medium text-foreground">Sort By</Label>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="total_invested">Total Invested</SelectItem>
                <SelectItem value="current_value">Current Value</SelectItem>
                <SelectItem value="profit_loss">P&L</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground">Filter by Type</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {investmentTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => onTypeToggle(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {(searchTerm || selectedTypes.length > 0) && (
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="w-full lg:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};
