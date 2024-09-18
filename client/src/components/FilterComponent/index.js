import React from 'react';
import './style.css';

function FilterComponent({ filters, onFilterChange, categories }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'minAmount' || name === 'maxAmount') {
      updatedValue = value === '' ? '' : parseFloat(value);
      if (isNaN(updatedValue)) return; // Ignore non-numeric inputs
    }

    onFilterChange({ ...filters, [name]: updatedValue });
  };

  return (
    <div className="filter-component">
      <select
        name="category"
        value={filters.category}
        onChange={handleInputChange}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div className="filter-input-group">
        <input
          type="number"
          name="minAmount"
          placeholder="Min Amount"
          value={filters.minAmount}
          onChange={handleInputChange}
          className="filter-input"
          min="0"
          step="any"
        />
        <input
          type="number"
          name="maxAmount"
          placeholder="Max Amount"
          value={filters.maxAmount}
          onChange={handleInputChange}
          className="filter-input"
          min="0"
          step="any"
        />
      </div>
      <input
        type="text"
        name="noteSearch"
        placeholder="Search in notes"
        value={filters.noteSearch}
        onChange={handleInputChange}
        className="filter-input filter-search"
      />
    </div>
  );
}

export default FilterComponent;