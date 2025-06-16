
import { useMemo } from "react";
import { InvestmentWithSummary, InvestmentPurpose, InvestmentType } from "@/types/investment";

interface FilterOptions {
  searchTerm: string;
  selectedTypes: InvestmentType[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  activeTab: InvestmentPurpose;
}

export const useFilteredInvestments = (
  investments: InvestmentWithSummary[],
  filters: FilterOptions
) => {
  const { searchTerm, selectedTypes, sortBy, sortOrder, activeTab } = filters;

  return useMemo(() => {
    let filtered = investments.filter((investment) => {
      const matchesPurpose = investment.purpose === activeTab;
      const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(investment.type);
      return matchesPurpose && matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'totalInvested':
          valueA = a.summary.totalInvested;
          valueB = b.summary.totalInvested;
          break;
        case 'currentValue':
          valueA = a.summary.currentValue;
          valueB = b.summary.currentValue;
          break;
        case 'profitLoss':
          valueA = a.summary.profitLoss;
          valueB = b.summary.profitLoss;
          break;
        case 'profitLossPercentage':
          valueA = a.summary.profitLossPercentage;
          valueB = b.summary.profitLossPercentage;
          break;
        case 'created_at':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [investments, searchTerm, selectedTypes, sortBy, sortOrder, activeTab]);
};
