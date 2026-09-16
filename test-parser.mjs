import { parseVoiceExpense, extractAmount, extractCategory, extractDate, extractNote } from './frontend/src/utils/voiceParser.js';

console.log('--- Testing CoinOrbit Voice Parser ---');

const testCases = [
  {
    input: "I spent 500 rupees on lunch today.",
    expectedAmount: 500,
    expectedCategory: 'Food',
    expectedNotePart: 'lunch',
  },
  {
    input: "I bought a shirt for 1200 rupees yesterday.",
    expectedAmount: 1200,
    expectedCategory: 'Clothes',
    expectedNotePart: 'shirt',
  },
  {
    input: "I spent 300 rupees watching a movie.",
    expectedAmount: 300,
    expectedCategory: 'Entertainment',
    expectedNotePart: 'movie',
  },
  {
    input: "five hundred rupees for dinner",
    expectedAmount: 500,
    expectedCategory: 'Food',
  },
  {
    input: "one thousand five hundred rupees for jeans",
    expectedAmount: 1500,
    expectedCategory: 'Clothes',
  },
  {
    input: "250 for netflix subscription",
    expectedAmount: 250,
    expectedCategory: 'Entertainment',
  },
  {
    input: "spent 1,500 on shoes",
    expectedAmount: 1500,
    expectedCategory: 'Clothes',
  },
];

let failed = 0;

testCases.forEach((tc, idx) => {
  const result = parseVoiceExpense(tc.input);
  console.log(`\n[Test ${idx + 1}] Input: "${tc.input}"`);
  console.log(` -> Parsed: Amount: ${result.amount}, Category: ${result.category}, Note: "${result.note}", Date: ${result.date}`);

  let ok = true;
  if (result.amount !== tc.expectedAmount) {
    console.error(`  ❌ Amount mismatch: expected ${tc.expectedAmount}, got ${result.amount}`);
    ok = false;
  }
  if (result.category !== tc.expectedCategory) {
    console.error(`  ❌ Category mismatch: expected ${tc.expectedCategory}, got ${result.category}`);
    ok = false;
  }
  if (tc.expectedNotePart && !result.note.toLowerCase().includes(tc.expectedNotePart.toLowerCase())) {
    console.error(`  ❌ Note mismatch: expected to include "${tc.expectedNotePart}", got "${result.note}"`);
    ok = false;
  }

  if (ok) {
    console.log('  ✓ Passed');
  } else {
    failed++;
  }
});

if (failed === 0) {
  console.log('\n✓ ALL VOICE PARSER TESTS PASSED PERFECTLY!\n');
} else {
  console.error(`\n❌ ${failed} voice parser tests failed.\n`);
  process.exit(1);
}
