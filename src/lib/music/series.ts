import { pc, NOTE_NAMES } from './pitch.js';
import type { PitchClass, IntervalClass } from './pitch.js';
import { chordFrom } from './chord.js';
import type { Chord } from './chord.js';
import type { SetForm } from './setForm.js';

export type Series = PitchClass[];

// ---------------------------------------------------------------------------
// Core transforms
// ---------------------------------------------------------------------------

export function seriesTranspose(s: Series, interval: IntervalClass): Series {
	return s.map((p) => pc(p + interval));
}

export function seriesInvert(s: Series, axis: IntervalClass = 0): Series {
	return s.map((p) => pc(axis - p));
}

export function seriesRetrograde(s: Series): Series {
	return [...s].reverse();
}

export function seriesMultiply(s: Series, m: number): Series {
	return s.map((p) => pc(p * m));
}

/**
 * Rotate within sub-chords of size `chordSize`.
 * newIndex = (i - (i % cs)) + ((i + shift) % cs)
 */
export function seriesRotate(s: Series, shift: number, chordSize?: number): Series {
	let cs = chordSize ?? s.length;
	if (s.length % cs !== 0) cs = s.length;
	return s.map((_, i) => {
		const iModCs = ((i % cs) + cs) % cs;
		const shiftedModCs = (((i + shift) % cs) + cs) % cs;
		const newIndex = i - iModCs + shiftedModCs;
		return s[newIndex];
	});
}

// ---------------------------------------------------------------------------
// Forms used by SetForm
// ---------------------------------------------------------------------------

export function seriesTransposedToBeginOn(s: Series, first: PitchClass): Series {
	return seriesTranspose(s, pc(first - (s[0] ?? 0)));
}

export function seriesInvertedToBeginOn(s: Series, first: PitchClass): Series {
	return s.map((p) => pc(first + (s[0] ?? 0) - p));
}

// ---------------------------------------------------------------------------
// Subdivision helpers
// ---------------------------------------------------------------------------

export function seriesFirstHexachord(s: Series): Chord {
	return chordFrom(s.slice(0, 6));
}

export function seriesChordsOfSize(s: Series, n: number): Chord[] {
	const result: Chord[] = [];
	for (let i = 0; i < s.length; i += n) {
		result.push(chordFrom(s.slice(i, i + n)));
	}
	return result;
}

/** Appends missing pitches 0–11 in order */
export function seriesCompletion(s: Series): Series {
	const missing: PitchClass[] = [];
	for (let i = 0; i < 12; i++) {
		if (!s.includes(i)) missing.push(i);
	}
	return [...s, ...missing];
}

// ---------------------------------------------------------------------------
// Analysis helpers
// ---------------------------------------------------------------------------

/**
 * 11-element histogram: intervals[pc(s[i]-s[i-1])-1]++ for directed intervals 1–11.
 */
export function seriesAdjacencyIntervals(s: Series): number[] {
	const intervals = new Array<number>(11).fill(0);
	for (let i = 1; i < s.length; i++) {
		const interval = pc(s[i] - s[i - 1]);
		if (interval >= 1 && interval <= 11) {
			intervals[interval - 1]++;
		}
	}
	return intervals;
}

export function seriesIsAllInterval(s: Series): boolean {
	const intervals = seriesAdjacencyIntervals(s);
	return intervals.every((count) => count === 1);
}

/**
 * Returns the degenerate set form if the series is equivalent to one of its
 * retrograde or retrograde-inversion forms, null otherwise.
 * Inlines the R/RI application to avoid a circular import with setForm.ts.
 */
export function seriesDegenerateForm(s: Series): SetForm | null {
	if (s.length !== 12) return null;

	const rBase = pc(s[0] - s[11]);
	const rApplied = seriesRetrograde(seriesTransposedToBeginOn(s, rBase));
	if (arraysEqual(s, rApplied)) return { kind: 'R', base: rBase };

	const riBase = pc(s[0] + s[11]);
	const riApplied = seriesRetrograde(seriesInvertedToBeginOn(s, riBase));
	if (arraysEqual(s, riApplied)) return { kind: 'RI', base: riBase };

	return null;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export type SeriesParseError =
	| { kind: 'repeatedPitch'; first: string; second: string }
	| { kind: 'invalidToken'; token: string };

export function isParseError(v: Series | SeriesParseError): v is SeriesParseError {
	return !Array.isArray(v);
}

export function parseSeries(
	input: string,
	pitchClassOfC: PitchClass = 0
): Series | SeriesParseError {
	const tokens = input.split(/[,\s\t]+/).filter((t) => t.length > 0);
	const pitches: PitchClass[] = [];
	const tokenAtIndex: string[] = [];

	for (const token of tokens) {
		let pitch: PitchClass;

		const normalized = token.replace(/#/g, 's').toLowerCase();
		const noteInterval = NOTE_NAMES[normalized];

		if (noteInterval !== undefined) {
			pitch = pc(pitchClassOfC + noteInterval);
		} else {
			const intValue = parseInt(token, 10);
			if (isNaN(intValue) || intValue < 0 || intValue > 11) {
				return { kind: 'invalidToken', token };
			}
			pitch = intValue as PitchClass;
		}

		const existingIndex = pitches.indexOf(pitch);
		if (existingIndex !== -1) {
			return { kind: 'repeatedPitch', first: tokenAtIndex[existingIndex], second: token };
		}

		tokenAtIndex.push(token);
		pitches.push(pitch);
	}

	return pitches;
}

// ---------------------------------------------------------------------------
// Internal utility
// ---------------------------------------------------------------------------

export function arraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
