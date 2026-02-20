import { pc } from './pitch.js';
import type { PitchClass } from './pitch.js';
import { seriesTransposedToBeginOn, seriesInvertedToBeginOn, seriesRetrograde } from './series.js';
import type { Series } from './series.js';

export type SetForm =
	| { kind: 'S'; base: PitchClass }
	| { kind: 'I'; base: PitchClass }
	| { kind: 'R'; base: PitchClass }
	| { kind: 'RI'; base: PitchClass };

function buildAllSetForms(): SetForm[] {
	const forms: SetForm[] = [];
	for (let b = 0; b < 12; b++) {
		forms.push({ kind: 'S', base: b });
	}
	for (let b = 0; b < 12; b++) {
		forms.push({ kind: 'I', base: b });
	}
	for (let b = 0; b < 12; b++) {
		forms.push({ kind: 'R', base: b });
	}
	for (let b = 0; b < 12; b++) {
		forms.push({ kind: 'RI', base: b });
	}
	return forms;
}

export const ALL_SET_FORMS: SetForm[] = buildAllSetForms();

export function applySetForm(form: SetForm, series: Series): Series {
	switch (form.kind) {
		case 'S':
			return seriesTransposedToBeginOn(series, form.base);
		case 'I':
			return seriesInvertedToBeginOn(series, form.base);
		case 'R':
			return seriesRetrograde(seriesTransposedToBeginOn(series, form.base));
		case 'RI':
			return seriesRetrograde(seriesInvertedToBeginOn(series, form.base));
	}
}

export function setFormLabel(form: SetForm): string {
	return `${form.kind}${form.base}`;
}

export function parseSetForm(s: string): SetForm | null {
	const match = s.match(/^(RI|R|I|S)(10|11|[0-9])$/);
	if (!match) return null;
	const kind = match[1] as SetForm['kind'];
	const base = parseInt(match[2], 10) as PitchClass;
	return { kind, base: pc(base) };
}

export function setFormsEqual(a: SetForm, b: SetForm): boolean {
	return a.kind === b.kind && a.base === b.base;
}
