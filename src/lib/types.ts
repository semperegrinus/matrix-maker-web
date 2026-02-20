import type { MatrixTransform } from './music/matrixTransform.js';

export interface MatrixData {
	id: string;
	name: string;
	transform: MatrixTransform;
	stravinskyVerticals: boolean;
	displayType: 'numbers' | 'noteNames';
	accidentals: 'sharps' | 'flats';
	lastViewedAt?: number; // ms since epoch
}

export interface SetData {
	id: string;
	title: string;
	seriesInput: string;
	pitchClassOfC: number; // 0–11
	matrices: MatrixData[];
}

export type AppState = { sets: SetData[] };
