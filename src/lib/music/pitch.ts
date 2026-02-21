export type PitchClass = number; // integer in [0, 11]
export type IntervalClass = number; // same range, used for intervals

/** Mod-12 helper — always returns a non-negative result. Use everywhere instead of `%`. */
export function pc(n: number): PitchClass {
	return ((n % 12) + 12) % 12;
}

export const NOTE_NAMES: Record<string, IntervalClass> = {
	c: 0,
	cs: 1,
	dv: 1,
	d: 2,
	ds: 3,
	ev: 3,
	e: 4,
	f: 5,
	fs: 6,
	gv: 6,
	g: 7,
	gs: 8,
	av: 8,
	a: 9,
	as: 10,
	bv: 10,
	b: 11
};

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export function pitchName(
	p: PitchClass,
	options?: { pitchClassOfC?: PitchClass; accidentals?: 'sharps' | 'flats' }
): string {
	const pcc = options?.pitchClassOfC ?? 0;
	const adjusted = pc(p - pcc);
	return options?.accidentals === 'flats' ? FLAT_NAMES[adjusted] : SHARP_NAMES[adjusted];
}
