import { describe, it, expect } from 'vitest';
import { pc, pitchName, NOTE_NAMES } from './pitch.js';

describe('pc()', () => {
	it('handles zero', () => expect(pc(0)).toBe(0));
	it('handles positive', () => expect(pc(7)).toBe(7));
	it('handles negative', () => expect(pc(-1)).toBe(11));
	it('handles negative large', () => expect(pc(-13)).toBe(11));
	it('wraps over 12', () => expect(pc(12)).toBe(0));
	it('wraps large', () => expect(pc(25)).toBe(1));
	// Swift BaseTests: Scalar(-4) + Scalar(3) == 11, PitchClass(-3) + IntervalClass(-4) == 5
	it('pc(-4 + 3) == pc(-1) == 11', () => expect(pc(-4 + 3)).toBe(11));
	it('pc(-3 + -4) == pc(-7) == 5', () => expect(pc(-3 + -4)).toBe(5));
	// Swift: PitchClass(6) - PitchClass(8) == IntervalClass(10)
	it('pc(6 - 8) == 10', () => expect(pc(6 - 8)).toBe(10));
});

describe('NOTE_NAMES', () => {
	it('c is 0', () => expect(NOTE_NAMES['c']).toBe(0));
	it('cs is 1', () => expect(NOTE_NAMES['cs']).toBe(1));
	it('dv is 1', () => expect(NOTE_NAMES['dv']).toBe(1));
	it('b is 11', () => expect(NOTE_NAMES['b']).toBe(11));
});

describe('pitchName()', () => {
	it('names C', () => expect(pitchName(0)).toBe('C'));
	it('names C# with sharps', () => expect(pitchName(1, { accidentals: 'sharps' })).toBe('C#'));
	it('names D♭ with flats', () => expect(pitchName(1, { accidentals: 'flats' })).toBe('D♭'));
	it('respects pitchClassOfC', () => expect(pitchName(2, { pitchClassOfC: 2 })).toBe('C'));
});
