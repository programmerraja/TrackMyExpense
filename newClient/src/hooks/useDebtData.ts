import { useState, useMemo } from "react";
import { useDebtTransactions } from "@/hooks/useTransactions";
import { Transaction, TransactionType } from "@/types/transaction";
import { Category } from "@/types/category";

export const useDebtData = (startDate?: Date, endDate?: Date) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState("event_date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: debtData, isLoading } = useDebtTransactions(startDate, endDate);
  const allTransactions = useMemo(() => debtData?.all || [], [debtData]);

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

  const groupedByCounterparty = useMemo(() => {
    const counterparties: { [key: string]: { lent: number; borrowed: number; transactions: Transaction[] } } = {};

    processedTransactions.forEach(t => {
      const key = t.counterparty || 'Unknown';
      if (!counterparties[key]) {
        counterparties[key] = { lent: 0, borrowed: 0, transactions: [] };
      }
      if (t.type === TransactionType.DEBT_GIVEN) {
        counterparties[key].lent += Number(t.amount);
      } else {
        counterparties[key].borrowed += Number(t.amount);
      }
      counterparties[key].transactions.push(t);
    });

    return Object.entries(counterparties).map(([name, data]) => ({
      name,
      lent: data.lent,
      borrowed: data.borrowed,
      net: data.lent - data.borrowed,
      transactions: data.transactions.sort((a,b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [processedTransactions]);

  const totalPages = Math.ceil(groupedByCounterparty.length / pageSize);
  
  const paginatedGroupedByCounterparty = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return groupedByCounterparty.slice(start, start + pageSize);
  }, [groupedByCounterparty, currentPage, pageSize]);
  
  const totalOutstanding = debtData?.debtGiven.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalBorrowed = debtData?.debtBought.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const netDebtPosition = totalOutstanding - totalBorrowed;
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
    isLoading,
    totalPages,
    totalOutstanding,
    totalBorrowed,
    netDebtPosition,
    availableCategories,
    debtGiven: debtData?.debtGiven || [],
    paginatedGroupedData: paginatedGroupedByCounterparty,
    groupedDataCount: groupedByCounterparty.length,
  };
};
