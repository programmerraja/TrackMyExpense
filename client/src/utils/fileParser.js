// File parser utility for CSV/TXT bank statement files
// Handles parsing using Papa Parse for CSV and custom parsing for TXT
import Papa from 'papaparse';

export const parseBankStatementFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'txt';
        
        if (fileType === 'csv') {
          parseCSVContent(content, resolve, reject);
        } else {
          parseTXTContent(content, resolve, reject);
        }
      } catch (error) {
        reject(new Error(`File parsing error: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

const parseCSVContent = (content, resolve, reject) => {
  Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        return;
      }
      
      const transactions = results.data.map((row, index) => ({
        id: `txn_${Date.now()}_${index}`,
        transactionDate: parseDate(row.Date || row['Value Date']),
        narration: row.Narration || '',
        valueDate: parseDate(row['Value Date'] || row.Date),
        debitAmount: parseFloat(row['Debit Amount'] || row['Debit'] || '0') || 0,
        creditAmount: parseFloat(row['Credit Amount'] || row['Credit'] || '0') || 0,
        referenceNumber: row['Chq/Ref Number'] || row['Reference'] || '',
        closingBalance: parseFloat(row['Closing Balance'] || row['Balance'] || '0') || 0,
        isSelected: false,
        expenseType: null,
        expenseCategory: '',
        expenseNote: ''
      }));
      
      resolve(transactions);
    },
    error: (error) => {
      reject(new Error(`CSV parsing failed: ${error.message}`));
    }
  });
};

const parseTXTContent = (content, resolve, reject) => {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    const transactions = [];
    
    // Skip header line if it exists
    const dataLines = lines.filter(line => 
      !line.toLowerCase().includes('date') || 
      !line.toLowerCase().includes('narration')
    );
    
    dataLines.forEach((line, index) => {
      // Parse fixed-width format based on sample
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length >= 7) {
        transactions.push({
          id: `txn_${Date.now()}_${index}`,
          transactionDate: parseDate(parts[0]),
          narration: parts[1] || '',
          valueDate: parseDate(parts[2]),
          debitAmount: parseFloat(parts[3] || '0') || 0,
          creditAmount: parseFloat(parts[4] || '0') || 0,
          referenceNumber: parts[5] || '',
          closingBalance: parseFloat(parts[6] || '0') || 0,
          isSelected: false,
          expenseType: null,
          expenseCategory: '',
          expenseNote: ''
        });
      }
    });
    
    resolve(transactions);
  } catch (error) {
    reject(new Error(`TXT parsing failed: ${error.message}`));
  }
};

const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Handle DD/MM/YY format
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2]) + 2000; // Assume 20xx for 2-digit years
    
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
};

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['.csv', '.txt'];
  
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit'
    };
  }
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Only CSV and TXT files are supported'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};
