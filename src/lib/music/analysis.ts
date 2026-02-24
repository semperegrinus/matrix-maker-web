import type { Chord } from './chord.js';
import { chordDisjoint, chordUnion, chordIsAggregate } from './chord.js';
import {
	seriesAdjacencyIntervals,
	seriesIsAllInterval,
	seriesDegenerateForm,
	seriesChordsOfSize,
	seriesCompletion,
	arraysEqual
} from './series.js';
import type { Series } from './series.js';
import { ALL_SET_FORMS, applySetForm } from './setForm.js';
import type { SetForm } from './setForm.js';
import { hexachordLookup } from './hexachordDb.js';
import type { HexachordInfo } from './hexachordDb.js';
import { ENABLE_DYADIC_ANALYSIS } from '../featureFlags.js';

export type CombinatorialityGroup = SetForm[];
export type CombinatorialityClass = CombinatorialityGroup[];

export interface HexachordalAnalysis {
	chords: Chord[];
	info: HexachordInfo | null;
	combinatorialForms: SetForm[];
}

export interface SeriesGenerator {
	series: Series;
	forms: CombinatorialityGroup[];
}

export interface CombinatorialAnalysis {
	chordSize: number;
	chords: Chord[];
	combinatorialityClasses: CombinatorialityClass[];
	generator: SeriesGenerator | null;
}

export interface SeriesAnalysis {
	series: Series;
	adjacencyIntervals: number[];
	allInterval: boolean;
	degenerateForm: SetForm | null;
	hexachordal: HexachordalAnalysis | null;
	tetrachordal: CombinatorialAnalysis | null;
	trichordal: CombinatorialAnalysis | null;
	dyadic: CombinatorialAnalysis | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ChordFormGroup {
	chords: Chord[];
	forms: CombinatorialityGroup;
}

/** Group all 48 set-form results by their chord partition string key */
function buildChordFormGroups(series: Series, chordSize: number): ChordFormGroup[] {
	const groups: ChordFormGroup[] = [];
	const indexByKey = new Map<string, number>();

	for (const form of ALL_SET_FORMS) {
		const chords = seriesChordsOfSize(applySetForm(form, series), chordSize);
		const key = JSON.stringify(chords);
		const existing = indexByKey.get(key);
		if (existing !== undefined) {
			groups[existing].forms.push(form);
		} else {
			indexByKey.set(key, groups.length);
			groups.push({ chords, forms: [form] });
		}
	}
	return groups;
}

/**
 * Zip two chord arrays pairwise. Returns the array of pairwise unions if every
 * pair is disjoint, otherwise null. Aggregate checking is deferred to the
 * final filter step so that multi-step accumulation (tetrachordal, trichordal)
 * can build up toward the aggregate incrementally.
 */
function combineChordArrays(a: Chord[], b: Chord[]): Chord[] | null {
	if (a.length !== b.length) return null;
	const result: Chord[] = [];
	for (let i = 0; i < a.length; i++) {
		if (!chordDisjoint(a[i], b[i])) return null;
		result.push(chordUnion(a[i], b[i]));
	}
	return result;
}

/** Direct port of Swift combinatorialityClasses(chordSize:) */
function combinatorialityClasses(series: Series, chordSize: number): CombinatorialityClass[] {
	if (series.length !== 12 || series.length % chordSize !== 0) return [];
	const chordCount = series.length / chordSize;

	const baseChords = seriesChordsOfSize(series, chordSize);
	const chordFormGroups = buildChordFormGroups(series, chordSize);

	type Entry = { total: Chord[]; groups: CombinatorialityGroup[] };
	const combinatorialities: Entry[] = [{ total: baseChords, groups: [] }];

	for (const chordFormGroup of chordFormGroups) {
		// Snapshot current entries before this outer iteration adds new ones
		const snapshot = combinatorialities.slice();
		for (const entry of snapshot) {
			const newTotal = combineChordArrays(entry.total, chordFormGroup.chords);
			if (newTotal !== null) {
				combinatorialities.push({
					total: newTotal,
					groups: [...entry.groups, chordFormGroup.forms]
				});
			}
		}
	}

	return combinatorialities
		.filter(
			(entry) =>
				entry.groups.length === chordCount - 1 && entry.total.every(chordIsAggregate)
		)
		.map((entry) => entry.groups);
}

/** Find all set forms that transform `base` into `target` */
function setFormsYielding(base: Series, target: Series): CombinatorialityGroup {
	return ALL_SET_FORMS.filter((form) => arraysEqual(applySetForm(form, base), target));
}

function computeGenerator(series: Series, chordSize: number): SeriesGenerator | null {
	if (series.length % chordSize !== 0) return null;
	const segmentCount = series.length / chordSize;
	if (segmentCount < 2) return null;

	const segments: Series[] = [];
	for (let i = 0; i < segmentCount; i++) {
		segments.push(series.slice(i * chordSize, (i + 1) * chordSize));
	}

	const first = segments[0];
	const rest = segments.slice(1);
	const forms = rest.map((seg) => setFormsYielding(first, seg));

	if (forms.some((f) => f.length === 0)) return null;
	return { series: first, forms };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function makeHexachordalAnalysis(series: Series): HexachordalAnalysis | null {
	if (series.length !== 6 && series.length !== 12) return null;
	const completion = seriesCompletion(series);
	const chords = seriesChordsOfSize(completion, 6);
	const info = hexachordLookup(completion);
	const classes = combinatorialityClasses(completion, 6);
	const combinatorialForms: SetForm[] = classes[0]?.[0] ?? [];
	return { chords, info, combinatorialForms };
}

function makeCombinatorialAnalysis(
	series: Series,
	chordSize: number
): CombinatorialAnalysis | null {
	if (series.length !== 12 && series.length !== 12 - chordSize) return null;
	const completion = seriesCompletion(series);
	const chords = seriesChordsOfSize(completion, chordSize);
	const rawClasses = combinatorialityClasses(completion, chordSize);

	// Identify the "base group": all set forms whose chord partition matches
	// the base series. Prepend it to every class so each class shows the
	// complete combinatorial grouping (base forms + complementary groups).
	const baseKey = JSON.stringify(chords);
	const baseGroup: CombinatorialityGroup = ALL_SET_FORMS.filter(
		(form) =>
			JSON.stringify(seriesChordsOfSize(applySetForm(form, completion), chordSize)) === baseKey
	);
	const classes: CombinatorialityClass[] = rawClasses.map((cls) => [baseGroup, ...cls]);

	const generator = computeGenerator(series, chordSize);
	return { chordSize, chords, combinatorialityClasses: classes, generator };
}

export function analyzeSeries(series: Series): SeriesAnalysis {
	const adjacencyIntervals = seriesAdjacencyIntervals(series);
	const allInterval = seriesIsAllInterval(series);
	const degenerateForm = seriesDegenerateForm(series);

	const hexachordal = makeHexachordalAnalysis(series);
	const tetrachordal = makeCombinatorialAnalysis(series, 4);
	const trichordal = makeCombinatorialAnalysis(series, 3);
	const dyadic = ENABLE_DYADIC_ANALYSIS ? makeCombinatorialAnalysis(series, 2) : null;

	return {
		series,
		adjacencyIntervals,
		allInterval,
		degenerateForm,
		hexachordal,
		tetrachordal,
		trichordal,
		dyadic
	};
}
