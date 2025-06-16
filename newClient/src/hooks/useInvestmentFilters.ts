
import { useState } from "react";
import { InvestmentType } from "@/types/investment";

export const useInvestmentFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<InvestmentType[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleTypeToggle = (type: InvestmentType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
  };

  return {
    searchTerm,
    selectedTypes,
    sortBy,
    sortOrder,
    setSearchTerm,
    handleTypeToggle,
    setSortBy,
    setSortOrder,
    handleClearFilters,
  };
};
