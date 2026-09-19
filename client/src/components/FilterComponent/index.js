import React from "react";

function FilterComponent({ filters, onFilterChange, categories, isDebtType }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      <select
        name={isDebtType ? "name" : "category"}
        value={isDebtType ? filters.name : filters.category}
        onChange={handleChange}
        className="field capitalize"
      >
        <option value="">
          All {isDebtType ? "people" : "categories"}
        </option>
        {categories.filter(Boolean).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <input
        type="search"
        name="noteSearch"
        placeholder="Search notes"
        value={filters.noteSearch}
        onChange={handleChange}
        className="field"
      />
    </div>
  );
}

export default FilterComponent;
