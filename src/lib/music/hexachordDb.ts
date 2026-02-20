import { pc } from './pitch.js';
import type { PitchClass } from './pitch.js';
import { chordFrom, chordTranspose, chordInvert, chordPitches } from './chord.js';
import type { Chord } from './chord.js';
import { parseSetForm } from './setForm.js';
import type { SetForm } from './setForm.js';
import type { Series } from './series.js';
import hexaData from '$lib/assets/hexachords.json';

export type HexachordalCombinatoriality =
	| '1st-order all-combinatorial'
	| '2nd-order all-combinatorial'
	| '3rd-order all-combinatorial'
	| '6th-order all-combinatorial'
	| 'I-combinatorial'
	| '2nd-order'
	| 'S-combinatorial'
	| 'RI-combinatorial'
	| 'non-combinatorial';

export type HexachordProperty = 'IE' | 'SI' | 'ST';

export interface HexachordRelation {
	number: number;
	relations: string[];
}

export interface HexachordInfo {
	number: number;
	normalForm: Chord;
	combinatoriality: HexachordalCombinatoriality;
	combinatorialForms: SetForm[];
	properties: HexachordProperty[];
	secondHexachord: HexachordRelation;
}

// Build lookup maps at module init
const byNormalForm = new Map<Chord, HexachordInfo>();
const byNumber = new Map<number, HexachordInfo>();

for (const entry of hexaData as Array<{
	number: number;
	normalForm: number[];
	combinatoriality: string;
	combinatorialForms: string[];
	properties: string[];
	secondHexachord: HexachordRelation;
}>) {
	const info: HexachordInfo = {
		number: entry.number,
		normalForm: chordFrom(entry.normalForm),
		combinatoriality: entry.combinatoriality as HexachordalCombinatoriality,
		combinatorialForms: entry.combinatorialForms
			.map((s) => parseSetForm(s))
			.filter((f): f is SetForm => f !== null),
		properties: entry.properties as HexachordProperty[],
		secondHexachord: entry.secondHexachord
	};
	byNormalForm.set(info.normalForm, info);
	byNumber.set(info.number, info);
}

/**
 * Looks up hexachord info for the first hexachord of a series.
 * Mirrors Swift HexachordDatabase.hexachordInfo(series:):
 * for each pitch in the chord, try transposing by -pitch and inverting about pitch.
 */
export function hexachordLookup(series: Series): HexachordInfo | null {
	const chord = chordFrom(series.slice(0, 6));
	const pitches = chordPitches(chord);

	for (const pitch of pitches) {
		// Transpose so this pitch lands on 0
		const transposed = chordTranspose(chord, pc(-pitch) as PitchClass);
		if (byNormalForm.has(transposed)) return byNormalForm.get(transposed)!;

		// Invert about this pitch
		const inverted = chordInvert(chord, pitch);
		if (byNormalForm.has(inverted)) return byNormalForm.get(inverted)!;
	}

	return null;
}

export function hexachordByNumber(n: number): HexachordInfo | undefined {
	return byNumber.get(n);
}
