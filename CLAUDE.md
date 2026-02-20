# Matrix Maker Web

Web interface for the analysis and visualization of 12-tone series and their transformations.
Written in Svelte 5 + TypeScript using pnpm.

## Agent Instructions

You are to implement any requested features in a structured fashion including testing.
We are using prettier, eslint, vitest, and playwright.

Any substantive feature should have unit tests.
Key UI flows should have e2e tests.
Tests should all pass before feature implementation is considered complete.

When adding features:
- Update relevant `docs/` files to document the feature
- All tests must pass: `pnpm test:unit` for unit tests, `pnpm check` for type checking

The overall structure of the repository is as follows:

```
src/
  routes/              # SvelteKit pages (UI)
    +layout.svelte     # App header, import/export, auto-save
    +page.svelte       # Sets list
    sets/[setId]/
      +page.svelte     # Set detail, matrices list
      matrices/[matrixId]/
        +page.svelte   # Matrix view with grid + analysis tabs
  lib/
    assets/            # Static data (hexachords.json)
    music/             # All domain logic — pure TS, no Svelte dependency
    components/        # Svelte UI components
      SetDialog.svelte
      MatrixDialog.svelte
      MatrixGrid.svelte
      AnalysisPanel.svelte
    types.ts           # AppState, SetData, MatrixData types
    state.svelte.ts    # Reactive state with localStorage persistence
    index.ts           # Re-exports from music/index.ts
docs/                  # Documentation for coding agents (see index below)
```

For details or individual source files, consult the `docs/`.
`docs/` contains agent-directed documentation for particular features/components/flows/concepts.
You must update the documentation after any major addition or change.
Keep the documentation concise: it is intended to give a conceptual OVERVIEW together with an indication of which source files contain IMPLEMENTATION DETAILS.

### docs/ index

| File | What to read it for |
|------|---------------------|
| `docs/architecture.md` | Stack, directory layout, module dependency order, state management, testing setup |
| `docs/ui.md` | Routes, components (SetDialog, MatrixDialog, MatrixGrid, AnalysisPanel), state flow, data model |
| `docs/music-domain.md` | Core types (PitchClass, Chord, Series, SetForm, MatrixTransform, Matrix, IntervalVector) and their APIs |
| `docs/analysis.md` | SeriesAnalysis shape, combinatoriality algorithm, degenerate form |
| `docs/hexachord-database.md` | hexachords.json schema, lookup algorithm, HexachordInfo types |
| `docs/conventions.md` | Arithmetic rules (always use pc()), formatting, import style, testing commands |

### Documentation maintenance

When adding a substantive new component or feature that is not covered by existing
docs/ files, add or update the relevant doc. The goal is that any file in the
codebase can be located and understood by reading the appropriate doc — docs should
serve as a roadmap, not comprehensive API references.

## Application Features

### User Flow

1. **Create a set** — User enters:
   - Title (e.g., "Webern Op. 24")
   - Series (space/comma-separated pitch classes or note names; e.g., "0 11 3 4 8 7 9 5 6 1 2 10")
   - Pitch class of C (0–11, controls note name mapping)

2. **Create a matrix** — User configures:
   - **Transform**: invert, multiplier (M5/M7/M11), rotation (full or intra-hexachordal), transpose
   - **Display**: numbers or note names (sharps/flats), Stravinsky verticals or standard layout
   - **Preview**: live preview of transformed series and first matrix row

3. **View matrix** — Two tabs:
   - **Matrix**: adjustable display options, print button
   - **Analysis**: interval vectors, hexachord info, combinatoriality classes

### Data Persistence

- Auto-save to `localStorage` on every change
- Export JSON file (downloadable backup)
- Import JSON file (restore or merge sets)

### Transformations Supported

- Invert: reflect about an axis (default 0)
- Multiply: M5 (×5), M7 (×7), M11 (×11)
- Rotate: 0–11 steps (full or intra-hexachordal)
- Transpose: to a specific pitch class

### Analysis Provided

- **Interval vector** (unordered pitch class intervals)
- **All-interval series** detection
- **Degenerate form** (series equivalent to its retrograde or RI form)
- **Hexachordal combinatoriality** (type, combinatorial forms, hexachord #)
- **Tetrachordal / Trichordal / Dyadic combinatoriality** (classes, generator forms)
- **Pitch class mapping** (C can be any of 0–11, affects note name display)

