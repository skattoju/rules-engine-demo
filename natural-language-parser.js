const { FIELD_MAPPING, FIELD_ALIASES, OPERATOR_MAPPING } = require('./field-mapping');

class NaturalLanguageParser {
  constructor() {
    this.patterns = [
      // Pattern: "show me transactions with amount less than 10"
      {
        regex: /show\s+me\s+transactions\s+with\s+(\w+(?:\s+\w+)*)\s+(less than|greater than|equal to|equals|is|lt|gt|lte|gte|<=|>=|<|>|=|==|!=)\s+([^\s]+)/i,
        extract: (match) => ({
          field: this.normalizeField(match[1]),
          operator: this.normalizeOperator(match[2]),
          value: this.parseValue(match[3])
        })
      },
      // Pattern: "amount < 10"
      {
        regex: /(\w+(?:\s+\w+)*)\s+(less than|greater than|equal to|equals|is|lt|gt|lte|gte|<=|>=|<|>|=|==|!=)\s+([^\s]+)/i,
        extract: (match) => ({
          field: this.normalizeField(match[1]),
          operator: this.normalizeOperator(match[2]),
          value: this.parseValue(match[3])
        })
      },
      // Pattern: "transactions where category is food_dining"
      {
        regex: /transactions\s+where\s+(\w+(?:\s+\w+)*)\s+(is|equals|=|==)\s+([^\s]+)/i,
        extract: (match) => ({
          field: this.normalizeField(match[1]),
          operator: 'equal',
          value: this.parseValue(match[3])
        })
      },
      // Pattern: "fraud transactions" or "fraudulent transactions"
      {
        regex: /(fraud|fraudulent)\s+transactions/i,
        extract: () => ({
          field: 'isFraud',
          operator: 'equal',
          value: 1
        })
      }
    ];
  }

  parseQuery(query) {
    console.log('Parsing query:', query);
    
    for (const pattern of this.patterns) {
      const match = query.match(pattern.regex);
      if (match) {
        console.log('Matched pattern:', pattern.regex);
        console.log('Match groups:', match);
        
        const condition = pattern.extract(match);
        console.log('Extracted condition:', condition);
        
        // Validate the condition
        if (this.validateCondition(condition)) {
          return {
            success: true,
            condition,
            rule: this.generateJsonRule(condition)
          };
        }
      }
    }
    
    return {
      success: false,
      error: 'Could not parse the query. Please try a format like: "show me transactions with amount less than 10"'
    };
  }

  normalizeField(fieldText) {
    const normalized = fieldText.toLowerCase().trim();
    
    // Check aliases first
    if (FIELD_ALIASES[normalized]) {
      return FIELD_ALIASES[normalized];
    }
    
    // Check direct field names
    for (const [index, field] of Object.entries(FIELD_MAPPING)) {
      if (field.name.toLowerCase() === normalized) {
        return field.name;
      }
    }
    
    // Return as-is if not found (might be a valid field name)
    return normalized;
  }

  normalizeOperator(operatorText) {
    const normalized = operatorText.toLowerCase().trim();
    return OPERATOR_MAPPING[normalized] || operatorText;
  }

  parseValue(valueText) {
    const trimmed = valueText.trim();
    
    // Try to parse as number
    const numValue = parseFloat(trimmed);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    // Return as string, removing quotes if present
    return trimmed.replace(/^["']|["']$/g, '');
  }

  validateCondition(condition) {
    // Check if field exists in our mapping
    const fieldExists = Object.values(FIELD_MAPPING).some(field => 
      field.name === condition.field
    ) || FIELD_ALIASES[condition.field];
    
    if (!fieldExists) {
      console.warn(`Unknown field: ${condition.field}`);
      // Don't reject - might be a valid field we don't know about
    }
    
    return condition.field && condition.operator && condition.value !== undefined;
  }

  generateJsonRule(condition) {
    return {
      conditions: {
        all: [
          {
            fact: condition.field,
            operator: condition.operator,
            value: condition.value
          }
        ]
      },
      event: {
        type: 'transaction-match',
        params: {
          message: `Transaction matches criteria: ${condition.field} ${condition.operator} ${condition.value}`,
          condition: condition
        }
      }
    };
  }

  // Get available fields for help/documentation
  getAvailableFields() {
    return Object.values(FIELD_MAPPING).map(field => ({
      name: field.name,
      type: field.type,
      description: field.description
    }));
  }

  // Get example queries
  getExampleQueries() {
    return [
      "show me transactions with amount less than 10",
      "show me transactions with amt > 100",
      "transactions where category is food_dining",
      "amount >= 50",
      "merchant equals Starbucks",
      "fraud transactions",
      "show me transactions with state is CA"
    ];
  }
}

module.exports = NaturalLanguageParser; 