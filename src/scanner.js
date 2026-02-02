/**
 * ClawdShield Scanner Logic
 */
const fs = require('fs');
const path = require('path');

const patternsPath = path.join(__dirname, 'patterns.json');
const PATTERNS_DB = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));

class Scanner {
  constructor() {
    this.categories = Object.keys(PATTERNS_DB);
  }

  /**
   * Scans a given input string for violations.
   * @param {string} input 
   * @returns {Object} Result of the scan
   */
  scan(input) {
    const results = {
      safe: true,
      timestamp: new Date().toISOString(),
      violations: []
    };

    if (!input || typeof input !== 'string') {
      return results;
    }

    for (const category of this.categories) {
      const patterns = PATTERNS_DB[category];
      for (const entry of patterns) {
        const regex = new RegExp(entry.pattern, 'i');
        if (regex.test(input)) {
          results.safe = false;
          results.violations.push({
            category,
            pattern: entry.pattern,
            description: entry.description
          });
        }
      }
    }

    return results;
  }
}

module.exports = new Scanner();
