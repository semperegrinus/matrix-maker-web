# Hexachord Database

## Data source

`src/lib/assets/hexachords.json` — 50 hexachord entries. Schema per entry:

```json
{
  "number": 1,
  "normalForm": [0,1,2,3,4,5],
  "combinatoriality": "1st-order all-combinatorial",
  "combinatorialForms": ["S6","I11","R0","RI5"],
  "properties": ["IE","SI"],
  "secondHexachord": { "number": 1, "relations": ["T","I"] }
}
```

## hexachordDb.ts

Builds two Maps at module init: `byNormalForm: Map<Chord, HexachordInfo>` and
`byNumber: Map<number, HexachordInfo>`. Normal forms are stored as Chord bitmasks.

## Lookup: hexachordLookup(series)

Extracts first 6 pitches as a Chord, then for each pitch `p` in the chord:
1. Try `chordTranspose(chord, -p)` — brings `p` to 0
2. Try `chordInvert(chord, p)` — invert about `p`

Returns the first match found in `byNormalForm`, or null.

## Types

```ts
type HexachordalCombinatoriality =
  | '1st-order all-combinatorial' | '2nd-order all-combinatorial'
  | '3rd-order all-combinatorial' | '6th-order all-combinatorial'
  | 'I-combinatorial' | '2nd-order' | 'S-combinatorial'
  | 'RI-combinatorial' | 'non-combinatorial'

type HexachordProperty = 'IE' | 'SI' | 'ST'
  // IE = interval exclusion, SI = self-inversional, ST = self-transpositional
```
