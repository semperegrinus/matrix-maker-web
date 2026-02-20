# Matrix Maker Web

Web interface for the analysis and visualization of 12-tone series and their transformations.
Written in Svelte 5 + TypeScript using pnpm.

## Codebase structure

```
src/
  routes/              # SvelteKit pages (UI — currently minimal)
  lib/
    assets/            # Static data (hexachords.json)
    music/             # All domain logic — pure TS, no Svelte dependency
      pitch.ts         # pc() mod-12, PitchClass/IntervalClass types, NOTE_NAMES
      chord.ts         # Chord bitmask type + set operations
      intervalVector.ts
      series.ts        # Series type + all transforms + parsing
      setForm.ts       # SetForm discriminated union (S/I/R/RI) + ALL_SET_FORMS
      matrixTransform.ts
      matrix.ts        # buildMatrix (standard + Stravinsky)
      hexachordDb.ts   # Hexachord lookup from hexachords.json
      analysis.ts      # analyzeSeries + combinatoriality algorithm
      index.ts         # Re-exports all of the above
    index.ts           # Re-exports from music/index.ts
docs/                  # Documentation for coding agents (see index below)
```

## docs/ index

| File | What to read it for |
|------|---------------------|
| `docs/architecture.md` | Stack, directory layout, module dependency order, testing setup |
| `docs/music-domain.md` | Core types (PitchClass, Chord, Series, SetForm, MatrixTransform, Matrix, IntervalVector) and their APIs |
| `docs/analysis.md` | SeriesAnalysis shape, combinatoriality algorithm, degenerate form |
| `docs/hexachord-database.md` | hexachords.json schema, lookup algorithm, HexachordInfo types |
| `docs/conventions.md` | Arithmetic rules (always use pc()), formatting, import style, testing commands |

## Basic user flow

- User creates a set (usually corresponding to a single piece of music)
- User creates a transformation/visualization/analysis for that set
- User views the transformed set as a matrix with supplemental analysis

### Transformations
- M5/M7 transform
- Rotations (full, intra-hexachordal, intra-tetrachordal, intra-trichordal)
- Transpositions

### Matrix options
- Stravinsky verticals
- View as numbers/pitch classes (configurable pitch class for C)

### Analysis
- Interval vector
- Hexachordal / tetrachordal / trichordal / dyadic combinatoriality
- All-interval series detection
- Degenerate form detection

## Documentation maintenance

When adding a substantive new component or feature that is not covered by existing
docs/ files, add or update the relevant doc. The goal is that any file in the
codebase can be located and understood by reading the appropriate doc — docs should
serve as a roadmap, not comprehensive API references.
