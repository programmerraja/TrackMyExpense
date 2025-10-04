// Session storage utility for bank statement data
// Handles saving/loading data to/from browser sessionStorage

const STORAGE_KEYS = {
  BANK_STATEMENT: 'bankStatement_',
  TRANSACTIONS: 'bankTransactions_',
  SESSION: 'bankStatementSession_',
  FILTERS: 'bankStatementFilters_',
  CHARTS: 'bankStatementCharts_'
};

export const saveBankStatement = (statement) => {
  try {
    const key = `${STORAGE_KEYS.BANK_STATEMENT}${statement.id}`;
    sessionStorage.setItem(key, JSON.stringify(statement));
    return true;
  } catch (error) {
    console.error('Failed to save bank statement:', error);
    return false;
  }
};

export const loadBankStatement = (id) => {
  try {
    const key = `${STORAGE_KEYS.BANK_STATEMENT}${id}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load bank statement:', error);
    return null;
  }
};

export const saveTransactions = (statementId, transactions) => {
  try {
    const key = `${STORAGE_KEYS.TRANSACTIONS}${statementId}`;
    sessionStorage.setItem(key, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Failed to save transactions:', error);
    return false;
  }
};

export const loadTransactions = (statementId) => {
  try {
    const key = `${STORAGE_KEYS.TRANSACTIONS}${statementId}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load transactions:', error);
    return [];
  }
};

export const saveUploadSession = (session) => {
  try {
    const key = `${STORAGE_KEYS.SESSION}${session.bankStatementId}`;
    sessionStorage.setItem(key, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error('Failed to save upload session:', error);
    return false;
  }
};

export const loadUploadSession = (statementId) => {
  try {
    const key = `${STORAGE_KEYS.SESSION}${statementId}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load upload session:', error);
    return null;
  }
};

export const saveFilters = (statementId, filters) => {
  try {
    const key = `${STORAGE_KEYS.FILTERS}${statementId}`;
    sessionStorage.setItem(key, JSON.stringify(filters));
    return true;
  } catch (error) {
    console.error('Failed to save filters:', error);
    return false;
  }
};

export const loadFilters = (statementId) => {
  try {
    const key = `${STORAGE_KEYS.FILTERS}${statementId}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : {
      dateRange: { start: null, end: null },
      searchText: '',
      transactionType: 'all',
      amountRange: { min: null, max: null }
    };
  } catch (error) {
    console.error('Failed to load filters:', error);
    return {
      dateRange: { start: null, end: null },
      searchText: '',
      transactionType: 'all',
      amountRange: { min: null, max: null }
    };
  }
};

export const saveChartData = (statementId, chartData) => {
  try {
    const key = `${STORAGE_KEYS.CHARTS}${statementId}`;
    sessionStorage.setItem(key, JSON.stringify(chartData));
    return true;
  } catch (error) {
    console.error('Failed to save chart data:', error);
    return false;
  }
};

export const loadChartData = (statementId) => {
  try {
    const key = `${STORAGE_KEYS.CHARTS}${statementId}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load chart data:', error);
    return null;
  }
};

export const clearStatementData = (statementId) => {
  try {
    const keys = [
      `${STORAGE_KEYS.BANK_STATEMENT}${statementId}`,
      `${STORAGE_KEYS.TRANSACTIONS}${statementId}`,
      `${STORAGE_KEYS.SESSION}${statementId}`,
      `${STORAGE_KEYS.FILTERS}${statementId}`,
      `${STORAGE_KEYS.CHARTS}${statementId}`
    ];
    
    keys.forEach(key => sessionStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear statement data:', error);
    return false;
  }
};

export const getAllStatementIds = () => {
  try {
    const keys = Object.keys(sessionStorage);
    const statementKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.BANK_STATEMENT));
    return statementKeys.map(key => key.replace(STORAGE_KEYS.BANK_STATEMENT, ''));
  } catch (error) {
    console.error('Failed to get statement IDs:', error);
    return [];
  }
};
