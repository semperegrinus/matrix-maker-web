# Series Analysis

Entry point: `analyzeSeries(series)` → `SeriesAnalysis` (analysis.ts).

## SeriesAnalysis shape

```ts
{
  series,
  adjacencyIntervals,   // 11-element histogram of directed intervals 1–11
  allInterval,          // true iff each directed interval appears exactly once
  degenerateForm,       // SetForm | null — R or RI form the series equals
  hexachordal,          // HexachordalAnalysis | null
  tetrachordal,         // CombinatorialAnalysis (chordSize=4) | null
  trichordal,           // CombinatorialAnalysis (chordSize=3) | null
  dyadic,               // CombinatorialAnalysis (chordSize=2) | null
}
```

## Combinatoriality algorithm

Implemented as `combinatorialityClasses(series, chordSize)` (internal).

1. Compute `baseChords = seriesChordsOfSize(series, chordSize)`
2. Group all 48 set-form results by chord partition (keyed by `JSON.stringify`)
   → `ChordFormGroup[]`
3. BFS accumulation: start with `[{ total: baseChords, groups: [] }]`.
   For each `chordFormGroup`, snapshot current accumulator entries, try
   `combineChordArrays(entry.total, group.chords)` — pairwise disjoint + aggregate.
   On success, push new entry.
4. Return entries where `groups.length === (12/chordSize - 1)`.

`combineChordArrays(a, b)`: zip, require each pair disjoint and union = AGGREGATE.

## HexachordalAnalysis

Calls `seriesCompletion` first (handles 6-note input).
`combinatorialForms` = first group of first combinatoriality class (`classes[0][0]`).
`info` = result of `hexachordLookup` (see hexachord-database.md).

## CombinatorialAnalysis

Handles series of length 12 or `12 - chordSize`.
`generator` field: splits series into segments; finds set forms transforming
first segment into each subsequent one (`setFormsYielding`).

## Degenerate form

`seriesDegenerateForm(s)` checks if applying R or RI to the series yields itself.
- R base = `pc(s[0] - s[11])`
- RI base = `pc(s[0] + s[11])`
