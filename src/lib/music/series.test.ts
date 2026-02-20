import { describe, it, expect } from 'vitest';
import {
	seriesTranspose,
	seriesInvert,
	seriesRetrograde,
	seriesMultiply,
	seriesRotate,
	seriesTransposedToBeginOn,
	seriesInvertedToBeginOn,
	seriesChordsOfSize,
	seriesCompletion,
	seriesAdjacencyIntervals,
	seriesIsAllInterval,
	seriesDegenerateForm,
	parseSeries,
	isParseError,
	arraysEqual
} from './series.js';
import { chordPitches } from './chord.js';

const ROW = [0, 11, 3, 4, 8, 7, 9, 6, 1, 5, 2, 10];

describe('seriesTranspose', () => {
	it('transposes by 1', () => {
		expect(seriesTranspose([0, 4, 7], 1)).toEqual([1, 5, 8]);
	});
	it('wraps mod 12', () => {
		expect(seriesTranspose([11], 1)).toEqual([0]);
	});
	// Swift: Series([0,11,10,9]).transposed(by: 3) == Series([3,2,1,0])
	it('Series([0,11,10,9]) transposed by 3 == [3,2,1,0]', () => {
		expect(seriesTranspose([0, 11, 10, 9], 3)).toEqual([3, 2, 1, 0]);
	});
});

describe('seriesTransposedToBeginOn', () => {
	it('transposes first element to target', () => {
		expect(seriesTransposedToBeginOn([0, 4, 7], 3)).toEqual([3, 7, 10]);
	});
	// Swift: Series([0,11,10,9]).transposed(toBeginOn: 4) == Series([4,3,2,1])
	it('Series([0,11,10,9]) transposedToBeginOn 4 == [4,3,2,1]', () => {
		expect(seriesTransposedToBeginOn([0, 11, 10, 9], 4)).toEqual([4, 3, 2, 1]);
	});
});

describe('seriesInvert', () => {
	it('inverts about 0', () => {
		expect(seriesInvert([0, 4, 7])).toEqual([0, 8, 5]);
	});
	it('inverts about axis', () => {
		expect(seriesInvert([0, 4], 6)).toEqual([6, 2]);
	});
});

describe('seriesInvertedToBeginOn', () => {
	it('inverts so first element is 0', () => {
		expect(seriesInvertedToBeginOn([0, 4, 7], 0)).toEqual([0, 8, 5]);
	});
	it('inverts so first element is target', () => {
		expect(seriesInvertedToBeginOn([0, 4, 7], 5)[0]).toBe(5);
	});
	// Swift: Series([5,8,9,7]).inverted(toBeginOn: 2) == Series([2,11,10,0])
	it('Series([5,8,9,7]) invertedToBeginOn 2 == [2,11,10,0]', () => {
		expect(seriesInvertedToBeginOn([5, 8, 9, 7], 2)).toEqual([2, 11, 10, 0]);
	});
});

describe('seriesRetrograde', () => {
	it('reverses', () => {
		expect(seriesRetrograde([0, 1, 2, 3])).toEqual([3, 2, 1, 0]);
	});
	it('does not mutate', () => {
		const s = [0, 1, 2];
		seriesRetrograde(s);
		expect(s).toEqual([0, 1, 2]);
	});
});

describe('seriesMultiply', () => {
	it('M5 on [0,1,2,3,4,5]', () => {
		expect(seriesMultiply([0, 1, 2, 3, 4, 5], 5)).toEqual([0, 5, 10, 3, 8, 1]);
	});
	// Swift: Series([0,11,10,9]).multiplied(by: 5) == Series([0,7,2,9])
	it('Series([0,11,10,9]).multiplied(by: 5) == [0,7,2,9]', () => {
		expect(seriesMultiply([0, 11, 10, 9], 5)).toEqual([0, 7, 2, 9]);
	});
});

describe('seriesRotate', () => {
	it('full rotation by 1', () => {
		expect(seriesRotate([0, 1, 2, 3], 1)).toEqual([1, 2, 3, 0]);
	});
	// Swift: Series([0,1,2,3]).rotated(by: 2) == Series([2,3,0,1])
	it('full rotation by 2', () => {
		expect(seriesRotate([0, 1, 2, 3], 2)).toEqual([2, 3, 0, 1]);
	});
	// Swift: Series(0...11).rotated(by: 1, chordSize: 6) == Series([1,2,3,4,5,0,7,8,9,10,11,6])
	it('intrahexachordal rotation by 1', () => {
		expect(seriesRotate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 1, 6)).toEqual([
			1, 2, 3, 4, 5, 0, 7, 8, 9, 10, 11, 6
		]);
	});
	// Swift: Series(0...11).rotated(by: 2, chordSize: 3) == Series([2,0,1,5,3,4,8,6,7,11,9,10])
	it('intratrichordal rotation by 2', () => {
		expect(seriesRotate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 2, 3)).toEqual([
			2, 0, 1, 5, 3, 4, 8, 6, 7, 11, 9, 10
		]);
	});
	// Swift: Series(0...11).rotated(by: 5, chordSize: 4) == Series([1,2,3,0,5,6,7,4,9,10,11,8])
	it('intratetrachordal rotation by 5', () => {
		expect(seriesRotate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 5, 4)).toEqual([
			1, 2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8
		]);
	});
});

describe('seriesChordsOfSize', () => {
	it('splits into hexachords', () => {
		const chords = seriesChordsOfSize(ROW, 6);
		expect(chords).toHaveLength(2);
		expect(chordPitches(chords[0]).sort((a, b) => a - b)).toEqual([0, 3, 4, 7, 8, 11]);
		expect(chordPitches(chords[1]).sort((a, b) => a - b)).toEqual([1, 2, 5, 6, 9, 10]);
	});
	// Swift: Series(0...11).chordsOfSize(4) == [Chord(0...3), Chord(4...7), Chord(8...11)]
	it('splits chromatic into tetrachords', () => {
		const chords = seriesChordsOfSize([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 4);
		expect(chords).toHaveLength(3);
		expect(chordPitches(chords[0])).toEqual([0, 1, 2, 3]);
		expect(chordPitches(chords[1])).toEqual([4, 5, 6, 7]);
		expect(chordPitches(chords[2])).toEqual([8, 9, 10, 11]);
	});
});

describe('seriesCompletion', () => {
	it('appends missing pitches in order', () => {
		const c = seriesCompletion([0, 1, 2, 3, 4, 5]);
		expect(c).toHaveLength(12);
		expect(c.slice(0, 6)).toEqual([0, 1, 2, 3, 4, 5]);
		expect(c.slice(6)).toEqual([6, 7, 8, 9, 10, 11]);
	});
});

describe('seriesAdjacencyIntervals', () => {
	it('returns 11-element array', () => {
		expect(seriesAdjacencyIntervals(ROW)).toHaveLength(11);
	});
	// Swift: Series(0...11).adjacencyIntervals() == [11,0,0,0,0,0,0,0,0,0,0]
	it('chromatic scale: all semitones', () => {
		expect(seriesAdjacencyIntervals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toEqual([
			11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]);
	});
	// Swift: Series([0,9,8,1,4,5,6,7,2,11,10,3]).adjacencyIntervals() == [3,0,1,0,2,0,1,0,2,0,2]
	it('Melby Symphony No. 3 row', () => {
		expect(seriesAdjacencyIntervals([0, 9, 8, 1, 4, 5, 6, 7, 2, 11, 10, 3])).toEqual([
			3, 0, 1, 0, 2, 0, 1, 0, 2, 0, 2
		]);
	});
	it('all-interval row [0,1,4,2,9,5,11,3,8,10,7,6] has all counts = 1', () => {
		expect(seriesAdjacencyIntervals([0, 1, 4, 2, 9, 5, 11, 3, 8, 10, 7, 6])).toEqual(
			Array(11).fill(1)
		);
	});
});

describe('seriesIsAllInterval', () => {
	it('true for [0,1,4,2,9,5,11,3,8,10,7,6]', () => {
		expect(seriesIsAllInterval([0, 1, 4, 2, 9, 5, 11, 3, 8, 10, 7, 6])).toBe(true);
	});
	// Swift: Series([8,11,7,0,9,10,4,6,1,5,3,2]).isAllInterval() == true
	it('true for Babbitt SQ2 [8,11,7,0,9,10,4,6,1,5,3,2]', () => {
		expect(seriesIsAllInterval([8, 11, 7, 0, 9, 10, 4, 6, 1, 5, 3, 2])).toBe(true);
	});
	// Swift: Series(0...11).isAllInterval() == false
	it('false for chromatic scale', () => {
		expect(seriesIsAllInterval([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(false);
	});
	it('false for ROW', () => {
		expect(seriesIsAllInterval(ROW)).toBe(false);
	});
});

describe('seriesDegenerateForm', () => {
	it('returns null for non-12 series', () => {
		expect(seriesDegenerateForm([0, 1, 2])).toBeNull();
	});
	it('returns null for non-degenerate row', () => {
		expect(seriesDegenerateForm(ROW)).toBeNull();
	});
});

describe('parseSeries', () => {
	// Swift: Series(string: "0 1, 2  \t3 ") == [0,1,2,3]
	it('parses space, comma, and tab separators', () => {
		const result = parseSeries('0 1, 2  \t3 ');
		expect(isParseError(result)).toBe(false);
		expect(result).toEqual([0, 1, 2, 3]);
	});
	it('parses full 12-tone row as integers', () => {
		const result = parseSeries('0 1 2 3 4 5 6 7 8 9 10 11');
		expect(isParseError(result)).toBe(false);
		expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
	});
	it('parses note names', () => {
		const result = parseSeries('c d e f g a b');
		expect(isParseError(result)).toBe(false);
		expect(result).toEqual([0, 2, 4, 5, 7, 9, 11]);
	});
	// Swift: XCTAssertThrowsError(try Series(string: "1 2 x"))
	it('detects invalid token', () => {
		const result = parseSeries('1 2 x');
		expect(isParseError(result)).toBe(true);
		if (isParseError(result)) expect(result.kind).toBe('invalidToken');
	});
	// Swift: XCTAssertThrowsError(try Series(string: "11 4 3 11"))
	it('detects repeated pitch', () => {
		const result = parseSeries('11 4 3 11');
		expect(isParseError(result)).toBe(true);
		if (isParseError(result)) expect(result.kind).toBe('repeatedPitch');
	});
	// Swift: XCTAssertThrowsError(try Series(string: "11 4 3 15")) — 15 is out of range
	it('detects out-of-range integer (15)', () => {
		const result = parseSeries('11 4 3 15');
		expect(isParseError(result)).toBe(true);
		if (isParseError(result)) expect(result.kind).toBe('invalidToken');
	});
});

describe('arraysEqual', () => {
	it('equal arrays', () => expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true));
	it('unequal arrays', () => expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false));
	it('different lengths', () => expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false));
});
