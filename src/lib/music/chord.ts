import { pc } from './pitch.js';
import type { PitchClass, IntervalClass } from './pitch.js';

/** 12-bit bitmask: bit i set → pitch i present */
export type Chord = number;

export const AGGREGATE: Chord = 0b111111111111;

export function chordFrom(pitches: PitchClass[]): Chord {
	let c = 0;
	for (const p of pitches) c |= 1 << pc(p);
	return c;
}

export function chordPitches(chord: Chord): PitchClass[] {
	const result: PitchClass[] = [];
	for (let i = 0; i < 12; i++) {
		if (chord & (1 << i)) result.push(i);
	}
	return result;
}

export function chordHas(chord: Chord, pitch: PitchClass): boolean {
	return (chord & (1 << pc(pitch))) !== 0;
}

export function chordUnion(a: Chord, b: Chord): Chord {
	return a | b;
}

export function chordIntersect(a: Chord, b: Chord): Chord {
	return a & b;
}

export function chordDisjoint(a: Chord, b: Chord): boolean {
	return (a & b) === 0;
}

export function chordIsAggregate(c: Chord): boolean {
	return c === AGGREGATE;
}

export function chordTranspose(c: Chord, interval: IntervalClass): Chord {
	const i = pc(interval);
	if (i === 0) return c;
	// Rotate bits left by i within 12 bits
	const shifted = ((c << i) | (c >> (12 - i))) & AGGREGATE;
	return shifted;
}

export function chordInvert(c: Chord, axis: IntervalClass): Chord {
	let result = 0;
	for (let i = 0; i < 12; i++) {
		if (c & (1 << i)) result |= 1 << pc(axis - i);
	}
	return result;
}

/**
 * Compare two chords: (1) count asc, (2) span asc, (3) lex pitch order asc.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareChords(a: Chord, b: Chord): number {
	const aCount = bitCount(a);
	const bCount = bitCount(b);
	if (aCount !== bCount) return aCount - bCount;

	const aPitches = chordPitches(a);
	const bPitches = chordPitches(b);

	if (aPitches.length === 0) return 0;

	const aSpan = aPitches[aPitches.length - 1] - aPitches[0];
	const bSpan = bPitches[bPitches.length - 1] - bPitches[0];
	if (aSpan !== bSpan) return aSpan - bSpan;

	for (let i = 0; i < aPitches.length; i++) {
		if (aPitches[i] !== bPitches[i]) return aPitches[i] - bPitches[i];
	}
	return 0;
}

export function chordNormalForm(c: Chord): Chord {
	let best = c;
	for (let i = 1; i < 12; i++) {
		const t = chordTranspose(c, -i);
		if (compareChords(t, best) < 0) best = t;
	}
	return best;
}

export function chordSpan(c: Chord): number {
	const pitches = chordPitches(c);
	if (pitches.length === 0) return 0;
	return pitches[pitches.length - 1] - pitches[0];
}

/** Returns all transposition intervals that map chord → target */
export function transpositionsYielding(chord: Chord, target: Chord): IntervalClass[] {
	const pitches = chordPitches(chord);
	if (pitches.length === 0) return [];
	const base = pitches[0];
	const targetPitches = chordPitches(target);
	return targetPitches
		.map((tp) => pc(tp - base))
		.filter((interval) => chordTranspose(chord, interval) === target);
}

function bitCount(n: number): number {
	let count = 0;
	let x = n;
	while (x) {
		count += x & 1;
		x >>>= 1;
	}
	return count;
}
