import React, { useState } from 'react';
import API from '../../utils/API';
import { useToast } from '../Toast';
import './style.css';

const AddStockForm = ({ onStockAdded }) => {
  const [stockName, setStockName] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stockName.trim() || !stockSymbol.trim()) {
      // showToast('Please enter both stock name and symbol', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await API.addUserStock({
        name: stockName,
        symbol: stockSymbol.toUpperCase()
      });
      
      // showToast('Stock added successfully!', 'success');
      setStockName('');
      setStockSymbol('');
      
      // Notify parent component that a stock was added
      if (onStockAdded) {
        onStockAdded(response.data);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      // showToast(
      //   error.response?.data?.error || 'Failed to add stock. Please try again.',
      //   'error'
      // );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-stock-form-container">
      <h3>Add Stock to Track</h3>
      <form onSubmit={handleSubmit} className="add-stock-form">
        <div className="form-group">
          <label htmlFor="stockName">Stock Name (Display Name)</label>
          <input
            type="text"
            id="stockName"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            placeholder="e.g., Reliance Industries"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stockSymbol">Stock Symbol (NSE Code)</label>
          <input
            type="text"
            id="stockSymbol"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            placeholder="e.g., RELIANCE"
            disabled={isSubmitting}
          />
          <small className="help-text">
            Enter the NSE symbol exactly as it appears on Groww or other trading platforms
          </small>
        </div>
        
        <button 
          type="submit" 
          className="add-stock-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Stock'}
        </button>
      </form>
    </div>
  );
};

export default AddStockForm;
