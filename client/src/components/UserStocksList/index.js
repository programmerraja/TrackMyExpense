import React, { useState, useEffect } from 'react';
import API from '../../utils/API';
import { useToast } from '../Toast';
import './style.css';

const UserStocksList = ({ onStockRemoved, refreshTrigger }) => {
  const [userStocks, setUserStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStocks();
  }, [refreshTrigger]);

  const fetchUserStocks = async () => {
    setLoading(true);
    try {
      const stocks = await API.getUserStocks();
      setUserStocks(stocks.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = async (symbol) => {
    if (!window.confirm('Are you sure you want to remove this stock?')) {
      return;
    }

    try {
      await API.removeUserStock(symbol);
      setUserStocks(userStocks.filter(stock => stock.symbol !== symbol));
      if (onStockRemoved) {
        onStockRemoved(symbol);
      }
    } catch (err) {
      console.error('Error removing stock:', err);
    }
  };

  if (loading) {
    return <div className="user-stocks-loading">Loading your stocks...</div>;
  }

  if (error) {
    return <div className="user-stocks-error">{error}</div>;
  }

  if (userStocks.length === 0) {
    return (
      <div className="user-stocks-empty">
        <p>You haven't added any stocks yet.</p>
      </div>
    );
  }

  return (
    <div className="user-stocks-container">
      <h3>Your Tracked Stocks</h3>
      <div className="user-stocks-list">
        {userStocks.map((stock) => (
          <div key={stock.symbol} className="user-stock-item">
            <div className="stock-info">
              <span className="stock-name">{stock.name}</span>
              <span className="stock-symbol">{stock.symbol}</span>
            </div>
            <button
              className="remove-stock-btn"
              onClick={() => handleRemoveStock(stock.symbol)}
              aria-label={`Remove ${stock.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStocksList;
