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

    // Attempt to detect and decode base64 payloads (common regex evasion).
    // If decoded text looks mostly printable, scan both original + decoded.
    const candidates = [input];
    const decoded = this.#tryDecodeBase64(input);
    if (decoded) candidates.push(decoded);

    for (const candidate of candidates) {
      for (const category of this.categories) {
        const patterns = PATTERNS_DB[category];
        for (const entry of patterns) {
          const regex = new RegExp(entry.pattern, 'i');
          if (regex.test(candidate)) {
            results.safe = false;
            results.violations.push({
              category,
              pattern: entry.pattern,
              description: entry.description,
              source: candidate === input ? 'raw' : 'base64_decoded'
            });
          }
        }
      }
    }

    return results;
  }

  #tryDecodeBase64(s) {
    const trimmed = String(s).trim();
    // Heuristic: long-ish base64 looking blob (no spaces), length multiple of 4
    if (trimmed.length < 32) return null;
    if (trimmed.length % 4 !== 0) return null;
    if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) return null;

    try {
      const buf = Buffer.from(trimmed, 'base64');
      if (!buf || !buf.length) return null;
      const txt = buf.toString('utf8');
      // Printable ratio check
      const printable = txt.replace(/[\x09\x0A\x0D\x20-\x7E\u3000-\u30FF\u4E00-\u9FFF]/g, '').length;
      const ratio = 1 - printable / Math.max(1, txt.length);
      if (ratio < 0.8) return null;
      return txt;
    } catch {
      return null;
    }
  }
}

module.exports = new Scanner();
