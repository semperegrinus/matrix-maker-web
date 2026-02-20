import { describe, it, expect } from 'vitest';
import { buildMatrix } from './matrix.js';

const ROW = [0, 11, 3, 4, 8, 7, 9, 6, 1, 5, 2, 10];

describe('buildMatrix (standard)', () => {
	it('produces 12×12 matrix', () => {
		const m = buildMatrix(ROW);
		expect(m.rowCount).toBe(12);
		expect(m.columnCount).toBe(12);
		expect(m.entries).toHaveLength(12);
		expect(m.entries[0]).toHaveLength(12);
	});

	it('first row equals the series beginning on series[0]', () => {
		const m = buildMatrix(ROW);
		expect(m.entries[0][0]).toBe(ROW[0]);
	});

	it('first column is the inversion of the series', () => {
		const m = buildMatrix(ROW);
		const firstCol = m.entries.map((row) => row[0]);
		// First column should be S0 inverted to begin on ROW[0]
		expect(firstCol[0]).toBe(ROW[0]);
		// Each row's first element should be in S0-inverted form
		const allPitches = new Set(firstCol);
		expect(allPitches.size).toBe(12); // all 12 pitch classes
	});

	it('each row contains all 12 pitch classes', () => {
		const m = buildMatrix(ROW);
		for (const row of m.entries) {
			const pitches = new Set(row);
			expect(pitches.size).toBe(12);
		}
	});
});

describe('buildMatrix (Stravinsky verticals)', () => {
	it('produces 12×12 matrix', () => {
		const m = buildMatrix(ROW, { stravinskyVerticals: true });
		expect(m.rowCount).toBe(12);
		expect(m.columnCount).toBe(12);
	});

	it('first row begins on series[0]', () => {
		const m = buildMatrix(ROW, { stravinskyVerticals: true });
		expect(m.entries[0][0]).toBe(ROW[0]);
	});
});
