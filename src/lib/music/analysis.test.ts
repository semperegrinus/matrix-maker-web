import { describe, it, expect } from 'vitest';
import { analyzeSeries } from './analysis.js';
import { seriesChordsOfSize, seriesRotate } from './series.js';
import { chordDisjoint, chordUnion, chordIsAggregate } from './chord.js';
import type { Chord } from './chord.js';
import { ENABLE_DYADIC_ANALYSIS } from '../featureFlags.js';

const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// Babbitt: String Quartet No. 2
const BABBITT_SQ2 = [8, 11, 7, 0, 9, 10, 4, 6, 1, 5, 3, 2];

// ---------------------------------------------------------------------------
// Helper: mirrors Swift's [[Chord]].isCombinatorial()
// Reduces chord-sequence groups left-to-right; each pairwise combine must be
// disjoint, and the final result must be all-aggregates.
// ---------------------------------------------------------------------------
function isCombinatorial(chordGroups: Chord[][]): boolean {
	let total: Chord[] | null = chordGroups[0];
	for (let i = 1; i < chordGroups.length; i++) {
		if (total === null) return false;
		const next = chordGroups[i];
		const combined: Chord[] = [];
		for (let j = 0; j < total.length; j++) {
			if (!chordDisjoint(total[j], next[j])) return false;
			combined.push(chordUnion(total[j], next[j]));
		}
		total = combined;
	}
	return total !== null && total.every(chordIsAggregate);
}

// ---------------------------------------------------------------------------
// Ported from Swift AnalysisTests.testCombinatoriality
// ---------------------------------------------------------------------------

describe('hexachordal combinatoriality (Swift testCombinatoriality)', () => {
	// Series(0...11).chordsOfSize(6).combinatorial(with: Series([6..11,0..5]).chordsOfSize(6)) == true
	it('chromatic + T6 complement is combinatorial', () => {
		const a = seriesChordsOfSize(CHROMATIC, 6);
		const b = seriesChordsOfSize([6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5], 6);
		expect(isCombinatorial([a, b])).toBe(true);
	});
	// Series(0...11).chordsOfSize(6).combinatorial(with: Series([4..11,0..3]).chordsOfSize(6)) == false
	it('chromatic + T4 is not combinatorial', () => {
		const a = seriesChordsOfSize(CHROMATIC, 6);
		const b = seriesChordsOfSize([4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3], 6);
		expect(isCombinatorial([a, b])).toBe(false);
	});
});

describe('tetrachordal combinatoriality (Swift testCombinatoriality)', () => {
	// [0,4,8].map{ Series(0...11).rotated(by:$0).chordsOfSize(4) }.isCombinatorial() == true
	it('chromatic rotated by 0,4,8 is tetra-combinatorial', () => {
		const groups = [0, 4, 8].map((r) => seriesChordsOfSize(seriesRotate(CHROMATIC, r), 4));
		expect(isCombinatorial(groups)).toBe(true);
	});
	// [0,5,8].map{ ... }.isCombinatorial() == false
	it('chromatic rotated by 0,5,8 is NOT tetra-combinatorial', () => {
		const groups = [0, 5, 8].map((r) => seriesChordsOfSize(seriesRotate(CHROMATIC, r), 4));
		expect(isCombinatorial(groups)).toBe(false);
	});
});

describe('combinatorialityClasses via analyzeSeries (Swift testCombinatoriality)', () => {
	// Series([8,11,7,0,9,10,4,6,1,5,3,2]).combinatorialityClasses(chordSize:6).first!.first!
	//   == [.S(2), .I(5), .R(8), .RI(11)]
	it('Babbitt SQ2 first hex combinatoriality group == [S2, I5, R8, RI11]', () => {
		const result = analyzeSeries(BABBITT_SQ2);
		const forms = result.hexachordal?.combinatorialForms ?? [];
		expect(forms).toEqual([
			{ kind: 'S', base: 2 },
			{ kind: 'I', base: 5 },
			{ kind: 'R', base: 8 },
			{ kind: 'RI', base: 11 }
		]);
	});
});

// ---------------------------------------------------------------------------
// General analyzeSeries coverage
// ---------------------------------------------------------------------------

describe('tetrachordal/trichordal combinatoriality via analyzeSeries', () => {
	// Chromatic scale has tetrachordal combinatoriality: rotations by 0, 4, 8 combine to aggregates
	it('chromatic scale has non-empty tetrachordal combinatoriality classes', () => {
		const result = analyzeSeries(CHROMATIC);
		expect(result.tetrachordal?.combinatorialityClasses.length).toBeGreaterThan(0);
	});

	it('chromatic scale tetrachordal classes include S4 and S8 forms', () => {
		const result = analyzeSeries(CHROMATIC);
		const classes = result.tetrachordal?.combinatorialityClasses ?? [];
		const allForms = classes.flatMap((cls) => cls.flatMap((group) => group));
		const kinds = allForms.map((f) => `${f.kind}${f.base}`);
		expect(kinds).toContain('S4');
		expect(kinds).toContain('S8');
	});

	it('chromatic scale tetrachordal classes each have 3 groups (base + 2 complementary)', () => {
		const result = analyzeSeries(CHROMATIC);
		const classes = result.tetrachordal?.combinatorialityClasses ?? [];
		expect(classes.length).toBeGreaterThan(0);
		for (const cls of classes) {
			expect(cls).toHaveLength(3); // chordCount = 12/4 = 3
		}
	});

	it('chromatic scale tetrachordal first group includes S0 (base form)', () => {
		const result = analyzeSeries(CHROMATIC);
		const firstClass = result.tetrachordal?.combinatorialityClasses[0] ?? [];
		const baseGroupLabels = (firstClass[0] ?? []).map((f) => `${f.kind}${f.base}`);
		expect(baseGroupLabels).toContain('S0');
	});

	it('chromatic scale has non-empty trichordal combinatoriality classes', () => {
		const result = analyzeSeries(CHROMATIC);
		expect(result.trichordal?.combinatorialityClasses.length).toBeGreaterThan(0);
	});

	it('chromatic scale trichordal classes each have 4 groups (base + 3 complementary)', () => {
		const result = analyzeSeries(CHROMATIC);
		const classes = result.trichordal?.combinatorialityClasses ?? [];
		expect(classes.length).toBeGreaterThan(0);
		for (const cls of classes) {
			expect(cls).toHaveLength(4); // chordCount = 12/3 = 4
		}
	});
});

describe('analyzeSeries', () => {
	it('returns the input series', () => {
		const result = analyzeSeries(BABBITT_SQ2);
		expect(result.series).toBe(BABBITT_SQ2);
	});

	it('adjacencyIntervals is 11 elements', () => {
		expect(analyzeSeries(BABBITT_SQ2).adjacencyIntervals).toHaveLength(11);
	});

	it('Babbitt SQ2 is all-interval', () => {
		expect(analyzeSeries(BABBITT_SQ2).allInterval).toBe(true);
	});

	it('chromatic scale is not all-interval', () => {
		expect(analyzeSeries(CHROMATIC).allInterval).toBe(false);
	});

	it('hexachordal analysis has 2 chords', () => {
		expect(analyzeSeries(BABBITT_SQ2).hexachordal?.chords).toHaveLength(2);
	});

	it('finds hexachord info from database', () => {
		expect(analyzeSeries(BABBITT_SQ2).hexachordal?.info).not.toBeNull();
	});

	it('tetrachordal chordSize is 4', () => {
		expect(analyzeSeries(BABBITT_SQ2).tetrachordal?.chordSize).toBe(4);
	});

	it('trichordal chordSize is 3', () => {
		expect(analyzeSeries(BABBITT_SQ2).trichordal?.chordSize).toBe(3);
	});

	it('dyadic is null when ENABLE_DYADIC_ANALYSIS is false', () => {
		if (ENABLE_DYADIC_ANALYSIS) {
			expect(analyzeSeries(BABBITT_SQ2).dyadic?.chordSize).toBe(2);
		} else {
			expect(analyzeSeries(BABBITT_SQ2).dyadic).toBeNull();
		}
	});

	it('degenerateForm is null for non-degenerate rows', () => {
		expect(analyzeSeries(BABBITT_SQ2).degenerateForm).toBeNull();
	});
});
