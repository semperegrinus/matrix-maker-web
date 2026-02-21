# Music Domain Model

## Core types (pitch.ts)

```ts
type PitchClass = number    // integer 0–11
type IntervalClass = number // same range, used for intervals
function pc(n): PitchClass  // ((n % 12) + 12) % 12 — USE THIS everywhere, never bare %
```

`NOTE_NAMES` maps string tokens (`'c'`, `'cs'`, `'dv'`, `'b'`, …) to interval-from-C.
Parsing input: replace `#` → `s`, lowercase, then look up in `NOTE_NAMES`.

## Chord (chord.ts)

`type Chord = number` — 12-bit bitmask, bit *i* set means pitch *i* present.

Key functions: `chordFrom(pitches)`, `chordPitches(chord)`, `chordTranspose`,
`chordInvert`, `chordNormalForm`, `chordUnion`, `chordIntersect`, `chordDisjoint`,
`chordIsAggregate`, `transpositionsYielding`.

`AGGREGATE = 0b111111111111` — all 12 pitches.

Normal form: transpose to each of 12 starting pitches, pick minimum by
(count asc, span asc, lex pitch order asc). Always starts on pitch 0.

## Series (series.ts)

`type Series = PitchClass[]` — ordered, length 12 by convention.

**Transforms** (all pure, return new array):
- `seriesTranspose(s, interval)`
- `seriesInvert(s, axis=0)` — maps p → pc(axis - p)
- `seriesRetrograde(s)`
- `seriesMultiply(s, m)` — M5/M7/M11
- `seriesRotate(s, shift, chordSize?)` — intra-subgroup rotation;
  formula: `newIndex = (i - i%cs) + ((i+shift) % cs)`
- `seriesTransposedToBeginOn(s, first)` — transpose so s[0] = first
- `seriesInvertedToBeginOn(s, first)` — map p → pc(first + s[0] - p)

**Subdivision**: `seriesChordsOfSize(s, n)` → `Chord[]`;
`seriesFirstHexachord(s)` → `Chord`.

**Completion**: `seriesCompletion(s)` appends missing pitches 0–11 in order.

## SetForm (setForm.ts)

```ts
type SetForm = { kind: 'S'|'I'|'R'|'RI', base: PitchClass }
```

`ALL_SET_FORMS` — 48 forms (S0–S11, I0–I11, R0–R11, RI0–RI11).

`applySetForm(form, series)`:
- S → transposedToBeginOn
- I → invertedToBeginOn
- R → retrograde(transposedToBeginOn)
- RI → retrograde(invertedToBeginOn)

`parseSetForm('RI11')` → `{ kind: 'RI', base: 11 }` or null.

## MatrixTransform (matrixTransform.ts)

Composite transform applied before matrix generation. Fields:
`invert`, `multiplier` (1/5/7/11), `rotation`, `intraHexachordal`,
`shouldTranspose`, `firstPitchClass`.

Application order: invert → multiply → rotate → transpose.
`DEFAULT_MATRIX_TRANSFORM` is identity (multiplier=1, rotation=0, invert=false).

Label helpers:
- `matrixTransformLabel(t)` — readable prose, e.g. `"inverted, M5, rotated by 3"`
- `matrixTransformConciseLabel(t)` — compact tokens, e.g. `"I · M5 · R3 · T→0"`;
  returns `"—"` for identity. Token forms: `I`, `M5`/`M7`/`M11`, `R{n}`, `IHR{n}`
  (intra-hexachordal rotation), `T→{pc}`.

## Matrix (matrix.ts)

`buildMatrix(series, { transform?, stravinskyVerticals? })` → `Matrix`.

**Standard**: apply transform → invert to get first column → each row transposes
transformed series to that column pitch.

**Stravinsky verticals**: each row is the transformed series rotated by rowIndex
then transposed to begin on `series[0]`.

**IntraHexachordal**: when `transform.intraHexachordal` is true and series has 12
pitches, `matrix.rowCount = 6` and rotation uses chordSize=6. **Caveat**: `rowCount`
is only used by the Stravinsky path (loop bound). The standard path always iterates the
full `firstColumn` (12 pitches), so `matrix.entries.length = 12` while `rowCount = 6`.
Always use `matrix.entries.length` for the actual rendered row count.

## IntervalVector (intervalVector.ts)

`type IntervalVector = [number,number,number,number,number,number]`

`computeIntervalVector(pitches)` — for each pair, ic = min(raw, 12-raw), v[ic-1]++.
