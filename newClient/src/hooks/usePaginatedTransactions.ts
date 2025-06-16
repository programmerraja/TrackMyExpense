
import { useState, useMemo } from "react";
import { Transaction } from "@/types/transaction";
import { Category } from "@/types/category";

export const usePaginatedTransactions = (allTransactions: Transaction[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState("event_date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const processedTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      const selectedCategoryIds = selectedCategories.map(c => c.id);
      filtered = filtered.filter(t => selectedCategoryIds.includes(t.category_id));
    }
    
    filtered.sort((a, b) => {
      let aVal, bVal;
      if(sortBy === 'category') {
        aVal = a.category?.name ?? '';
        bVal = b.category?.name ?? '';
      } else {
        aVal = a[sortBy as keyof typeof a] ?? '';
        bVal = b[sortBy as keyof typeof b] ?? '';
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allTransactions, searchTerm, selectedCategories, sortBy, sortOrder]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTransactions.slice(start, start + pageSize);
  }, [processedTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(processedTransactions.length / pageSize);
  
  const availableCategories = useMemo(() => {
    const uniqueCategories = new Map<string, Category>();
    allTransactions.forEach(t => {
      if (t.category) {
        uniqueCategories.set(t.category.id, t.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [allTransactions]);
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSortBy("event_date");
    setSortOrder("desc");
    setCurrentPage(1);
  };
  
  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => {
      const isSelected = prev.some(c => c.id === category.id);
      if (isSelected) {
        return prev.filter(c => c.id !== category.id);
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1);
  };
  
  return {
    // State
    searchTerm,
    selectedCategories,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    
    // Setters
    setSearchTerm,
    handleCategoryToggle,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    handleClearFilters,

    // Data
    paginatedTransactions,
    processedTransactions,
    totalPages,
    availableCategories,
  };
};
