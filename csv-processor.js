const fs = require('fs');
const csv = require('csv-parser');
const { FIELD_MAPPING } = require('./field-mapping');

class CSVProcessor {
  constructor(csvFilePath) {
    this.csvFilePath = csvFilePath;
    this.transactions = [];
  }

  async loadTransactions() {
    return new Promise((resolve, reject) => {
      const transactions = [];
      
      fs.createReadStream(this.csvFilePath)
        .pipe(csv({ headers: false })) // No headers in our CSV
        .on('data', (row) => {
          // Convert array-like object to actual array
          const rowArray = Object.values(row);
          
          // Map CSV columns to field names
          const transaction = {};
          for (const [index, field] of Object.entries(FIELD_MAPPING)) {
            const columnIndex = parseInt(index);
            if (columnIndex < rowArray.length) {
              let value = rowArray[columnIndex];
              
              // Type conversion based on field type
              switch (field.type) {
                case 'number':
                  value = parseFloat(value) || 0;
                  break;
                case 'datetime':
                  value = new Date(value);
                  break;
                case 'date':
                  value = new Date(value);
                  break;
                default:
                  // Keep as string, but clean up
                  value = String(value).trim();
              }
              
              transaction[field.name] = value;
            }
          }
          
          transactions.push(transaction);
        })
        .on('end', () => {
          this.transactions = transactions;
          console.log(`Loaded ${transactions.length} transactions`);
          resolve(transactions);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  getTransactions() {
    return this.transactions;
  }

  // Get a sample of transactions for testing
  getSampleTransactions(count = 5) {
    return this.transactions.slice(0, count);
  }

  // Get transaction statistics
  getStatistics() {
    if (this.transactions.length === 0) {
      return { error: 'No transactions loaded' };
    }

    const amounts = this.transactions.map(t => t.amt).filter(amt => !isNaN(amt));
    const categories = [...new Set(this.transactions.map(t => t.category))];
    const merchants = [...new Set(this.transactions.map(t => t.merchant))];
    
    return {
      totalTransactions: this.transactions.length,
      amountStats: {
        min: Math.min(...amounts),
        max: Math.max(...amounts),
        average: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
      },
      uniqueCategories: categories.length,
      categories: categories.slice(0, 10), // First 10 categories
      uniqueMerchants: merchants.length,
      merchants: merchants.slice(0, 10), // First 10 merchants
      fraudCount: this.transactions.filter(t => t.isFraud === 1).length
    };
  }
}

module.exports = CSVProcessor; 