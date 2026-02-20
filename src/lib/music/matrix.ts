import type { PitchClass } from './pitch.js';
import { seriesInvertedToBeginOn, seriesTransposedToBeginOn, seriesRotate } from './series.js';
import type { Series } from './series.js';
import { applyMatrixTransform, DEFAULT_MATRIX_TRANSFORM } from './matrixTransform.js';
import type { MatrixTransform } from './matrixTransform.js';

export interface Matrix {
	rowCount: number;
	columnCount: number;
	entries: PitchClass[][];
}

export function buildMatrix(
	series: Series,
	options?: {
		transform?: MatrixTransform;
		stravinskyVerticals?: boolean;
	}
): Matrix {
	const transform = options?.transform ?? DEFAULT_MATRIX_TRANSFORM;
	const stravinsky = options?.stravinskyVerticals ?? false;

	const transformed = applyMatrixTransform(transform, series);
	const intraHexachordal = series.length === 12 && transform.intraHexachordal;

	const rowCount = series.length === 12 && intraHexachordal ? 6 : series.length;
	const columnCount = series.length;

	const first = series[0] as PitchClass;

	const entries: PitchClass[][] = [];

	if (stravinsky) {
		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const rotated = seriesRotate(transformed, rowIndex, intraHexachordal ? 6 : undefined);
			const transposed = seriesTransposedToBeginOn(rotated, first);
			entries.push(transposed);
		}
	} else {
		const firstColumn = seriesInvertedToBeginOn(transformed, first);
		for (const pitch of firstColumn) {
			entries.push(seriesTransposedToBeginOn(transformed, pitch as PitchClass));
		}
	}

	return { rowCount, columnCount, entries };
}
