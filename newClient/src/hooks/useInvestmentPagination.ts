
import { useState, useMemo } from "react";

export const useInvestmentPagination = <T>(items: T[], initialPageSize: number = 25) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(items.length / pageSize);
  
  const paginatedItems = useMemo(() => {
    return items.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [items, currentPage, pageSize]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPageSize,
    handlePageSizeChange,
    resetPagination,
  };
};
