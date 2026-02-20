import { describe, it, expect } from 'vitest';
import { computeIntervalVector } from './intervalVector.js';

// Swift AnalysisTests.testIntervalVector — called on Chord pitches, same computation
describe('computeIntervalVector', () => {
	it('[0,1,2,3,4,5] == [5,4,3,2,1,0]', () => {
		expect(computeIntervalVector([0, 1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1, 0]);
	});
	it('[0,1,2,3,4,6] == [4,4,3,2,1,1]', () => {
		expect(computeIntervalVector([0, 1, 2, 3, 4, 6])).toEqual([4, 4, 3, 2, 1, 1]);
	});
	it('[0,1,2,4,5,6] == [4,3,2,3,2,1]', () => {
		expect(computeIntervalVector([0, 1, 2, 4, 5, 6])).toEqual([4, 3, 2, 3, 2, 1]);
	});
	it('[3,4,5,6,8,9] == [4,3,3,2,2,1]', () => {
		expect(computeIntervalVector([3, 4, 5, 6, 8, 9])).toEqual([4, 3, 3, 2, 2, 1]);
	});
});
