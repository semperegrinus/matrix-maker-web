import { pc } from './pitch.js';
import type { PitchClass } from './pitch.js';

export type IntervalVector = [number, number, number, number, number, number];

export function computeIntervalVector(pitches: PitchClass[]): IntervalVector {
	const v: IntervalVector = [0, 0, 0, 0, 0, 0];
	for (let i = 0; i < pitches.length; i++) {
		for (let j = i + 1; j < pitches.length; j++) {
			const raw = pc(pitches[j] - pitches[i]);
			const ic = Math.min(raw, 12 - raw);
			if (ic > 0) v[ic - 1]++;
		}
	}
	return v;
}
