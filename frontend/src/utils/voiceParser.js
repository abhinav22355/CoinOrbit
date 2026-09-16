/**
 * CoinOrbit Voice Parser
 * A modular rule-based Natural Language Processing utility for voice expense extraction.
 * Extracts: Amount (numeric and word forms), Category (Food, Clothes, Entertainment, Other),
 * Date (relative and explicit), and Note.
 */

// Word to number dictionary for spoken numbers
const SMALL_NUMBERS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const MAGNITUDES = {
  hundred: 100,
  thousand: 1000,
  lakh: 100000,
  million: 1000000,
};

// Category dictionary with semantic keywords
const CATEGORY_KEYWORDS = {
  Food: [
    'lunch', 'dinner', 'breakfast', 'brunch', 'restaurant', 'food', 'pizza',
    'burger', 'coffee', 'tea', 'cafe', 'snacks', 'meal', 'meals', 'groceries',
    'grocery', 'fruits', 'vegetables', 'biryani', 'swiggy', 'zomato', 'eat',
    'eating', 'drinks', 'juice', 'sandwich', 'ice cream', 'dessert', 'starbucks',
  ],
  Clothes: [
    'shirt', 't-shirt', 'jeans', 'dress', 'shoes', 'jacket', 'clothes',
    'clothing', 'shopping', 'pant', 'pants', 'trousers', 'hoodie', 'sneakers',
    'boots', 't-shirts', 'suit', 'kurta', 'saree', 'apparel', 'sandals',
  ],
  Entertainment: [
    'movie', 'movies', 'cinema', 'game', 'gaming', 'concert', 'party',
    'netflix', 'entertainment', 'theatre', 'theater', 'show', 'spotify',
    'prime', 'youtube', 'outing', 'club', 'pub', 'amusement', 'ticket', 'tickets',
  ],
};

const MONTHS_MAP = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

/**
 * Converts words representing numbers (e.g. "one thousand five hundred") into an integer.
 */
function wordsToNumber(text) {
  const words = text.toLowerCase().replace(/[-]/g, ' ').split(/\s+/);
  let total = 0;
  let current = 0;
  let found = false;

  for (const word of words) {
    if (SMALL_NUMBERS[word] !== undefined) {
      current += SMALL_NUMBERS[word];
      found = true;
    } else if (MAGNITUDES[word] !== undefined) {
      if (current === 0) current = 1;
      current *= MAGNITUDES[word];
      if (word === 'thousand' || word === 'lakh' || word === 'million') {
        total += current;
        current = 0;
      }
      found = true;
    } else if (word === 'and') {
      continue;
    } else {
      if (found) break; // End of number segment
    }
  }

  total += current;
  return found && total > 0 ? total : null;
}

/**
 * Extracts amount from text (either digits, currency notations, or spoken words)
 */
export function extractAmount(text) {
  if (!text) return null;

  // 1. Look for digits with currency symbols or commas (e.g. ₹500, Rs. 1,500, 1200 rupees, 500)
  // Match full number tokens with or without comma formatting
  const digitRegex = /(?:₹|rs\.?|inr|\$)?\s*\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\b\s*(?:rupees|bucks|rs\.?)?/i;
  const digitMatch = text.match(digitRegex);

  // Check if match captured a numeric amount
  if (digitMatch && digitMatch[1]) {
    const rawNumber = digitMatch[1].replace(/,/g, '');
    const num = parseFloat(rawNumber);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // 2. Try parsing spoken number words
  const parsedFromWords = wordsToNumber(text);
  if (parsedFromWords !== null && parsedFromWords > 0) {
    return parsedFromWords;
  }

  return null;
}

/**
 * Extracts category based on keywords
 */
export function extractCategory(text) {
  if (!text) return 'Other';

  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Word boundary match
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lower)) {
        return category;
      }
    }
  }

  return 'Other';
}

/**
 * Extracts date from text (today, yesterday, tomorrow, or explicit format)
 */
export function extractDate(text) {
  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!text) return formatYMD(now);

  const lower = text.toLowerCase();

  // Relative dates
  if (/\byesterday\b/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return formatYMD(d);
  }

  if (/\btomorrow\b/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return formatYMD(d);
  }

  if (/\btoday\b/i.test(lower)) {
    return formatYMD(now);
  }

  // Numeric Date match: DD/MM/YYYY or YYYY-MM-DD
  const ddmmyyyy = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return formatYMD(new Date(year, month, day));
  }

  // Named Month Match: "15 September 2026" or "September 15, 2026" or "15 September"
  for (const [mName, mNum] of Object.entries(MONTHS_MAP)) {
    const regex1 = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${mName}(?:\\s+(\\d{4}))?\\b`, 'i');
    const match1 = lower.match(regex1);
    if (match1) {
      const day = parseInt(match1[1], 10);
      const year = match1[2] ? parseInt(match1[2], 10) : now.getFullYear();
      return formatYMD(new Date(year, mNum - 1, day));
    }

    const regex2 = new RegExp(`\\b${mName}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'i');
    const match2 = lower.match(regex2);
    if (match2) {
      const day = parseInt(match2[1], 10);
      const year = match2[2] ? parseInt(match2[2], 10) : now.getFullYear();
      return formatYMD(new Date(year, mNum - 1, day));
    }
  }

  return formatYMD(now);
}

/**
 * Extracts a concise human-readable note describing the expense
 */
export function extractNote(text, category) {
  if (!text) return category || 'Expense';

  let cleaned = text.trim();

  // Look for common patterns: "on <item>", "for <item>", "bought a <item>"
  const forOnMatch = cleaned.match(/(?:for|on|bought a|bought an|spent on|paying for|watching a|watching)\s+([a-zA-Z0-9\s]+?)(?=\s+(?:today|yesterday|tomorrow|rupees|rs|for|\$|\d)|$)/i);
  if (forOnMatch && forOnMatch[1]) {
    const note = forOnMatch[1].trim();
    if (note.length > 1 && !['rupees', 'money', 'it'].includes(note.toLowerCase())) {
      return note.charAt(0).toUpperCase() + note.slice(1);
    }
  }

  // Check category keywords present in string to use as note
  if (category && CATEGORY_KEYWORDS[category]) {
    for (const kw of CATEGORY_KEYWORDS[category]) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(cleaned)) {
        return kw.charAt(0).toUpperCase() + kw.slice(1);
      }
    }
  }

  return category || 'Expense';
}

/**
 * Main parser function: processes raw speech transcript and returns structured expense object.
 */
export function parseVoiceExpense(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      amount: '',
      category: 'Other',
      note: '',
      date: new Date().toISOString().split('T')[0],
      rawTranscript: '',
      confidence: 0,
      isValid: false,
    };
  }

  const cleanText = transcript.trim();
  const amount = extractAmount(cleanText);
  const category = extractCategory(cleanText);
  const date = extractDate(cleanText);
  const note = extractNote(cleanText, category);

  // Determine parsing confidence
  let confidenceScore = 0;
  if (amount !== null && amount > 0) confidenceScore += 0.5;
  if (category !== 'Other') confidenceScore += 0.3;
  if (note) confidenceScore += 0.2;

  return {
    amount: amount !== null ? amount : '',
    category,
    note,
    date,
    rawTranscript: cleanText,
    confidence: confidenceScore,
    isValid: amount !== null && amount > 0,
  };
}

export default parseVoiceExpense;
