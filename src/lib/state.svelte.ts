import type { AppState, SetData, MatrixData } from './types.js';

const STORAGE_KEY = 'matrix-maker-state';

function loadInitialState(): AppState {
	if (typeof localStorage === 'undefined') return { sets: [] };
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored) as AppState;
	} catch {
		// ignore parse errors
	}
	return { sets: [] };
}

export const appState: AppState = $state(loadInitialState());

export function saveState(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

export function exportState(): void {
	const json = JSON.stringify(appState, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'matrix-maker.json';
	a.click();
	URL.revokeObjectURL(url);
}

export function importState(json: string): void {
	const parsed = JSON.parse(json) as AppState;
	appState.sets = parsed.sets;
	saveState();
}

// ---------------------------------------------------------------------------
// Set CRUD
// ---------------------------------------------------------------------------

export function createSet(title: string, seriesInput: string, pitchClassOfC: number): SetData {
	const set: SetData = {
		id: crypto.randomUUID(),
		title,
		seriesInput,
		pitchClassOfC,
		matrices: []
	};
	appState.sets.push(set);
	return set;
}

export function updateSet(
	id: string,
	patch: Partial<Omit<SetData, 'id' | 'matrices'>>
): void {
	const set = appState.sets.find((s) => s.id === id);
	if (!set) return;
	Object.assign(set, patch);
}

export function deleteSet(id: string): void {
	const index = appState.sets.findIndex((s) => s.id === id);
	if (index !== -1) appState.sets.splice(index, 1);
}

// ---------------------------------------------------------------------------
// Matrix CRUD
// ---------------------------------------------------------------------------

export function createMatrix(setId: string, data: Omit<MatrixData, 'id'>): MatrixData {
	const set = appState.sets.find((s) => s.id === setId);
	if (!set) throw new Error('Set not found');
	const matrix: MatrixData = { id: crypto.randomUUID(), ...data };
	set.matrices.push(matrix);
	return matrix;
}

export function updateMatrix(
	setId: string,
	matrixId: string,
	patch: Partial<MatrixData>
): void {
	const set = appState.sets.find((s) => s.id === setId);
	if (!set) return;
	const matrix = set.matrices.find((m) => m.id === matrixId);
	if (!matrix) return;
	Object.assign(matrix, patch);
}

export function deleteMatrix(setId: string, matrixId: string): void {
	const set = appState.sets.find((s) => s.id === setId);
	if (!set) return;
	const index = set.matrices.findIndex((m) => m.id === matrixId);
	if (index !== -1) set.matrices.splice(index, 1);
}
