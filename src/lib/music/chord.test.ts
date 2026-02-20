import { describe, it, expect } from 'vitest';
import {
	chordFrom,
	chordPitches,
	chordHas,
	chordUnion,
	chordIntersect,
	chordDisjoint,
	chordIsAggregate,
	chordTranspose,
	chordInvert,
	chordNormalForm,
	chordSpan,
	transpositionsYielding,
	AGGREGATE
} from './chord.js';

describe('chordFrom / chordPitches', () => {
	it('round-trips pitches', () => {
		expect(chordPitches(chordFrom([0, 3, 7]))).toEqual([0, 3, 7]);
	});
	it('deduplicates', () => {
		expect(chordPitches(chordFrom([0, 0, 3]))).toEqual([0, 3]);
	});
});

describe('chordHas', () => {
	it('detects presence and absence', () => {
		const c = chordFrom([0, 4, 7]);
		expect(chordHas(c, 0)).toBe(true);
		expect(chordHas(c, 4)).toBe(true);
		expect(chordHas(c, 7)).toBe(true);
		expect(chordHas(c, 1)).toBe(false);
	});
});

describe('chordTranspose', () => {
	// Swift: Chord([3,6,11,8]).transposed(by: 3) == Chord([6,9,2,11])
	it('Chord([3,6,11,8]) transposed by 3 == Chord([6,9,2,11])', () => {
		expect(chordTranspose(chordFrom([3, 6, 11, 8]), 3)).toBe(chordFrom([6, 9, 2, 11]));
	});
	it('shifts pitches by 1', () => {
		expect(chordTranspose(chordFrom([0, 4, 7]), 1)).toBe(chordFrom([1, 5, 8]));
	});
	it('wraps at 12', () => {
		expect(chordTranspose(chordFrom([11]), 1)).toBe(chordFrom([0]));
	});
	it('by 0 is identity', () => {
		const c = chordFrom([0, 3, 6, 9]);
		expect(chordTranspose(c, 0)).toBe(c);
	});
});

describe('chordInvert', () => {
	// Swift: Chord([2,8,3,9]).inverted(about: 5) == Chord([3,9,2,8])
	it('Chord([2,8,3,9]) inverted about 5 == Chord([3,9,2,8])', () => {
		expect(chordInvert(chordFrom([2, 8, 3, 9]), 5)).toBe(chordFrom([3, 9, 2, 8]));
	});
	// Swift: Chord([0,1,2,3]).inverted(about: 2) == Chord([2,1,0,11])
	it('Chord([0,1,2,3]) inverted about 2 == Chord([2,1,0,11])', () => {
		expect(chordInvert(chordFrom([0, 1, 2, 3]), 2)).toBe(chordFrom([2, 1, 0, 11]));
	});
	it('inverts about 0', () => {
		// 0→0, 4→8, 7→5
		expect(chordInvert(chordFrom([0, 4, 7]), 0)).toBe(chordFrom([0, 5, 8]));
	});
});

describe('chordUnion', () => {
	// Swift: Chord(0...3).union(with: Chord(2...6)) == Chord(0...6)
	it('Chord(0..3).union(Chord(2..6)) == Chord(0..6)', () => {
		expect(chordUnion(chordFrom([0, 1, 2, 3]), chordFrom([2, 3, 4, 5, 6]))).toBe(
			chordFrom([0, 1, 2, 3, 4, 5, 6])
		);
	});
	// Swift: Chord(1...3).union(with: Chord(5...10)) == Chord([1,2,3,5,6,7,8,9,10])
	it('Chord(1..3).union(Chord(5..10)) == Chord([1,2,3,5,6,7,8,9,10])', () => {
		expect(chordUnion(chordFrom([1, 2, 3]), chordFrom([5, 6, 7, 8, 9, 10]))).toBe(
			chordFrom([1, 2, 3, 5, 6, 7, 8, 9, 10])
		);
	});
});

describe('chordIntersect', () => {
	// Swift: Chord(1...5).intersected(with: Chord(4...7)) == Chord(4...5)
	it('Chord(1..5).intersected(Chord(4..7)) == Chord(4..5)', () => {
		expect(chordIntersect(chordFrom([1, 2, 3, 4, 5]), chordFrom([4, 5, 6, 7]))).toBe(
			chordFrom([4, 5])
		);
	});
	// Swift: Chord([1,3,5,7,9,11]).intersected(with: Chord(5...11)) == Chord([5,7,9,11])
	it('Chord([1,3,5,7,9,11]).intersected(Chord(5..11)) == Chord([5,7,9,11])', () => {
		expect(
			chordIntersect(chordFrom([1, 3, 5, 7, 9, 11]), chordFrom([5, 6, 7, 8, 9, 10, 11]))
		).toBe(chordFrom([5, 7, 9, 11]));
	});
});

describe('chordDisjoint', () => {
	it('true when no overlap', () =>
		expect(chordDisjoint(chordFrom([0, 1, 2]), chordFrom([3, 4, 5]))).toBe(true));
	it('false when overlap', () =>
		expect(chordDisjoint(chordFrom([0, 1, 2]), chordFrom([2, 3, 4]))).toBe(false));
});

describe('chordIsAggregate', () => {
	// Swift: Chord(0...11).isAggregate() == true
	it('Chord(0..11).isAggregate() == true', () => {
		expect(chordIsAggregate(AGGREGATE)).toBe(true);
	});
	// Swift: Chord(1...11).isAggregate() == false
	it('Chord(1..11).isAggregate() == false', () => {
		expect(chordIsAggregate(chordFrom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))).toBe(false);
	});
	it('AGGREGATE has 12 pitches', () => {
		expect(chordPitches(AGGREGATE)).toHaveLength(12);
	});
});

describe('chordNormalForm', () => {
	it('chromatic hexachord starting at 6 normalizes to [0,1,2,3,4,5]', () => {
		expect(chordNormalForm(chordFrom([6, 7, 8, 9, 10, 11]))).toBe(chordFrom([0, 1, 2, 3, 4, 5]));
	});
	it('is idempotent', () => {
		const c = chordFrom([0, 2, 4, 6, 8, 10]);
		expect(chordNormalForm(chordNormalForm(c))).toBe(chordNormalForm(c));
	});
});

describe('chordSpan', () => {
	it('[0,4,7] has span 7', () => expect(chordSpan(chordFrom([0, 4, 7]))).toBe(7));
	it('empty chord has span 0', () => expect(chordSpan(0)).toBe(0));
});

describe('transpositionsYielding', () => {
	it('finds interval that maps C-major to G-major', () => {
		expect(transpositionsYielding(chordFrom([0, 4, 7]), chordFrom([7, 11, 2]))).toContain(7);
	});
});
