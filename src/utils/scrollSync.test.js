import { calculateScrollPercentage, calculateTargetScrollTop } from './scrollSync.js';
import assert from 'node:assert';

console.log('Running test suite for scrollSync...');

// 1. Invalid and non-numeric inputs
assert.strictEqual(calculateScrollPercentage(null, 1000, 500), 0);
assert.strictEqual(calculateScrollPercentage(100, null, 500), 0);
assert.strictEqual(calculateScrollPercentage(100, 1000, undefined), 0);
assert.strictEqual(calculateTargetScrollTop(null, 1000, 500), 0);
assert.strictEqual(calculateTargetScrollTop(0.5, null, 500), 0);
assert.strictEqual(calculateTargetScrollTop(0.5, 1000, undefined), 0);

// 2. Non-scrollable containers (scrollHeight <= clientHeight)
assert.strictEqual(calculateScrollPercentage(0, 400, 500), 0);
assert.strictEqual(calculateScrollPercentage(50, 500, 500), 0);
assert.strictEqual(calculateTargetScrollTop(0.5, 400, 500), 0);
assert.strictEqual(calculateTargetScrollTop(0.8, 500, 500), 0);

// 3. Normal scrolling progression
// maxScroll = 1500 - 500 = 1000
assert.strictEqual(calculateScrollPercentage(0, 1500, 500), 0);
assert.strictEqual(calculateScrollPercentage(250, 1500, 500), 0.25);
assert.strictEqual(calculateScrollPercentage(500, 1500, 500), 0.5);
assert.strictEqual(calculateScrollPercentage(750, 1500, 500), 0.75);
assert.strictEqual(calculateScrollPercentage(1000, 1500, 500), 1);

// Target scroll calculations (target maxScroll = 2500 - 500 = 2000)
assert.strictEqual(calculateTargetScrollTop(0, 2500, 500), 0);
assert.strictEqual(calculateTargetScrollTop(0.25, 2500, 500), 500);
assert.strictEqual(calculateTargetScrollTop(0.5, 2500, 500), 1000);
assert.strictEqual(calculateTargetScrollTop(0.75, 2500, 500), 1500);
assert.strictEqual(calculateTargetScrollTop(1, 2500, 500), 2000);

// 4. Boundary clamping (negative scroll and overscroll)
assert.strictEqual(calculateScrollPercentage(-50, 1500, 500), 0);
assert.strictEqual(calculateScrollPercentage(1200, 1500, 500), 1);
assert.strictEqual(calculateTargetScrollTop(-0.5, 2500, 500), 0);
assert.strictEqual(calculateTargetScrollTop(1.5, 2500, 500), 2000);

console.log('All scrollSync math tests passed successfully!');
