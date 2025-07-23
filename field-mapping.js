// Field mapping for credit card transaction CSV
// Maps CSV column indices to meaningful field names for rule generation

const FIELD_MAPPING = {
  0: { name: 'transactionId', type: 'string', description: 'Unique transaction identifier' },
  1: { name: 'timestamp', type: 'datetime', description: 'Transaction timestamp' },
  2: { name: 'cardNumber', type: 'string', description: 'Credit card number' },
  3: { name: 'merchant', type: 'string', description: 'Merchant name' },
  4: { name: 'category', type: 'string', description: 'Transaction category (home, travel, food_dining, etc.)' },
  5: { name: 'amt', type: 'number', description: 'Transaction amount in dollars' },
  6: { name: 'firstName', type: 'string', description: 'Cardholder first name' },
  7: { name: 'lastName', type: 'string', description: 'Cardholder last name' },
  8: { name: 'gender', type: 'string', description: 'Cardholder gender (M/F)' },
  9: { name: 'streetAddress', type: 'string', description: 'Street address' },
  10: { name: 'city', type: 'string', description: 'City' },
  11: { name: 'state', type: 'string', description: 'State abbreviation' },
  12: { name: 'zip', type: 'string', description: 'ZIP code' },
  13: { name: 'lat', type: 'number', description: 'Latitude coordinate' },
  14: { name: 'long', type: 'number', description: 'Longitude coordinate' },
  15: { name: 'cityPop', type: 'number', description: 'City population' },
  16: { name: 'job', type: 'string', description: 'Job title' },
  17: { name: 'dob', type: 'date', description: 'Date of birth' },
  18: { name: 'transHash', type: 'string', description: 'Transaction hash' },
  19: { name: 'unixTime', type: 'number', description: 'Unix timestamp' },
  20: { name: 'merLat', type: 'number', description: 'Merchant latitude' },
  21: { name: 'merLong', type: 'number', description: 'Merchant longitude' },
  22: { name: 'isFraud', type: 'number', description: 'Fraud indicator (0/1)' },
  23: { name: 'merZip', type: 'string', description: 'Merchant ZIP code' }
};

// Common field aliases for natural language processing
const FIELD_ALIASES = {
  'amount': 'amt',
  'price': 'amt',
  'cost': 'amt',
  'value': 'amt',
  'dollars': 'amt',
  'money': 'amt',
  'transaction amount': 'amt',
  'store': 'merchant',
  'shop': 'merchant',
  'business': 'merchant',
  'vendor': 'merchant',
  'company': 'merchant',
  'name': 'firstName',
  'first name': 'firstName',
  'last name': 'lastName',
  'surname': 'lastName',
  'location': 'city',
  'place': 'city',
  'fraud': 'isFraud',
  'fraudulent': 'isFraud',
  'suspicious': 'isFraud'
};

// Operator mapping for natural language to json-rules-engine operators
const OPERATOR_MAPPING = {
  'less than': 'lessThan',
  'lt': 'lessThan',
  '<': 'lessThan',
  'greater than': 'greaterThan',
  'gt': 'greaterThan',
  '>': 'greaterThan',
  'equal to': 'equal',
  'equals': 'equal',
  'is': 'equal',
  '=': 'equal',
  '==': 'equal',
  'not equal to': 'notEqual',
  'not equals': 'notEqual',
  '!=': 'notEqual',
  'less than or equal': 'lessThanInclusive',
  'lte': 'lessThanInclusive',
  '<=': 'lessThanInclusive',
  'greater than or equal': 'greaterThanInclusive',
  'gte': 'greaterThanInclusive',
  '>=': 'greaterThanInclusive',
  'contains': 'contains',
  'includes': 'contains',
  'in': 'in'
};

module.exports = {
  FIELD_MAPPING,
  FIELD_ALIASES,
  OPERATOR_MAPPING
}; 