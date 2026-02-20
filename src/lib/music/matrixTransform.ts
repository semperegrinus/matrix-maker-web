import type { PitchClass } from './pitch.js';
import { seriesInvert, seriesMultiply, seriesRotate, seriesTransposedToBeginOn } from './series.js';
import type { Series } from './series.js';

export interface MatrixTransform {
	invert: boolean;
	multiplier: number; // 1, 5, 7, or 11
	rotation: number;
	intraHexachordal: boolean;
	shouldTranspose: boolean;
	firstPitchClass: PitchClass;
}

export const DEFAULT_MATRIX_TRANSFORM: MatrixTransform = {
	invert: false,
	multiplier: 1,
	rotation: 0,
	intraHexachordal: false,
	shouldTranspose: false,
	firstPitchClass: 0
};

/** Order: invert → multiply → rotate (intraHexachordal uses chordSize=6) → transpose */
export function applyMatrixTransform(t: MatrixTransform, series: Series): Series {
	let result = series;
	if (t.invert) result = seriesInvert(result);
	result = seriesMultiply(result, t.multiplier);
	result = seriesRotate(result, t.rotation, t.intraHexachordal ? 6 : undefined);
	if (t.shouldTranspose) result = seriesTransposedToBeginOn(result, t.firstPitchClass);
	return result;
}

export function matrixTransformLabel(t: MatrixTransform): string {
	if (isIdentityTransform(t)) return 'Unaltered';
	const tokens: string[] = [];
	if (t.invert) tokens.push('inverted');
	if (t.multiplier !== 1) tokens.push(`M${t.multiplier}`);
	if (t.rotation !== 0) {
		tokens.push(`${t.intraHexachordal ? 'intrahexachordal ' : ''}rotated by ${t.rotation}`);
	}
	if (t.shouldTranspose) tokens.push(`transposed to begin on ${t.firstPitchClass}`);
	return tokens.join(', ');
}

export function isIdentityTransform(t: MatrixTransform): boolean {
	return t.multiplier === 1 && t.rotation === 0 && !t.invert;
}
