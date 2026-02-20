import { describe, it, expect } from 'vitest';
import {
	ALL_SET_FORMS,
	applySetForm,
	setFormLabel,
	parseSetForm,
	setFormsEqual
} from './setForm.js';

describe('ALL_SET_FORMS', () => {
	it('has 48 forms', () => expect(ALL_SET_FORMS).toHaveLength(48));
	it('starts with S0', () => expect(ALL_SET_FORMS[0]).toEqual({ kind: 'S', base: 0 }));
	it('has all four kinds', () => {
		const kinds = new Set(ALL_SET_FORMS.map((f) => f.kind));
		expect(kinds).toEqual(new Set(['S', 'I', 'R', 'RI']));
	});
});

describe('applySetForm', () => {
	const s = [0, 11, 3, 4, 8, 7, 9, 6, 1, 5, 2, 10];

	it('S0 is identity (begin on 0)', () => {
		expect(applySetForm({ kind: 'S', base: 0 }, s)).toEqual(s);
	});
	it('S3 transposes to begin on 3', () => {
		const result = applySetForm({ kind: 'S', base: 3 }, s);
		expect(result[0]).toBe(3);
		expect(result).toHaveLength(12);
	});
	it('I0 inverts to begin on 0', () => {
		const result = applySetForm({ kind: 'I', base: 0 }, s);
		expect(result[0]).toBe(0);
	});
	it('R0 is retrograde of S0', () => {
		const result = applySetForm({ kind: 'R', base: 0 }, s);
		expect(result[0]).toBe(s[11]);
	});
	it('RI0 is retrograde of I0', () => {
		const ri = applySetForm({ kind: 'RI', base: 0 }, s);
		const i = applySetForm({ kind: 'I', base: 0 }, s);
		expect(ri).toEqual([...i].reverse());
	});
});

describe('setFormLabel', () => {
	it('labels S5 correctly', () => expect(setFormLabel({ kind: 'S', base: 5 })).toBe('S5'));
	it('labels RI11 correctly', () => expect(setFormLabel({ kind: 'RI', base: 11 })).toBe('RI11'));
});

describe('parseSetForm', () => {
	it('parses S0', () => expect(parseSetForm('S0')).toEqual({ kind: 'S', base: 0 }));
	it('parses RI11', () => expect(parseSetForm('RI11')).toEqual({ kind: 'RI', base: 11 }));
	it('parses I10', () => expect(parseSetForm('I10')).toEqual({ kind: 'I', base: 10 }));
	it('returns null for invalid', () => expect(parseSetForm('X5')).toBeNull());
	it('returns null for out-of-range', () => expect(parseSetForm('S12')).toBeNull());
});

describe('setFormsEqual', () => {
	it('equal forms', () =>
		expect(setFormsEqual({ kind: 'S', base: 3 }, { kind: 'S', base: 3 })).toBe(true));
	it('different kind', () =>
		expect(setFormsEqual({ kind: 'S', base: 3 }, { kind: 'I', base: 3 })).toBe(false));
	it('different base', () =>
		expect(setFormsEqual({ kind: 'S', base: 3 }, { kind: 'S', base: 4 })).toBe(false));
});
