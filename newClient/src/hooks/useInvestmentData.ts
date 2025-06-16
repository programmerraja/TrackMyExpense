
import { Investment, InvestmentPurpose } from "@/types/investment";
import { useInvestmentFilters } from "./useInvestmentFilters";
import { useInvestmentPagination } from "./useInvestmentPagination";
import { useInvestmentSummaries } from "./useInvestmentSummaries";
import { useFilteredInvestments } from "./useFilteredInvestments";

export const useInvestmentData = (investments: Investment[] = [], activeTab: InvestmentPurpose) => {
  const filters = useInvestmentFilters();
  const { investmentsWithSummary, portfolioSummary, watchlistSummary } = useInvestmentSummaries(investments);
  
  const filteredAndSortedInvestments = useFilteredInvestments(investmentsWithSummary, {
    ...filters,
    activeTab
  });

  const pagination = useInvestmentPagination(filteredAndSortedInvestments);

  // Reset pagination when filters change
  const handleTypeToggle = (type: any) => {
    filters.handleTypeToggle(type);
    pagination.resetPagination();
  };

  const handleClearFilters = () => {
    filters.handleClearFilters();
    pagination.resetPagination();
  };

  return {
    // Filter state and actions
    ...filters,
    handleTypeToggle,
    handleClearFilters,

    // Pagination state and actions
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    setCurrentPage: pagination.setCurrentPage,
    setPageSize: pagination.setPageSize,
    handlePageSizeChange: pagination.handlePageSizeChange,

    // Derived data
    paginatedInvestments: pagination.paginatedItems,
    filteredAndSortedInvestments,
    portfolioSummary,
    watchlistSummary,
  };
};
