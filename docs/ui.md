# Web Interface

## Overview

The Matrix Maker web interface is a single-page app (SPA) for managing 12-tone series and their
matrix transformations. Built with Svelte 5 + SvelteKit, it stores all data in `localStorage`
and allows export/import of JSON files.

**Key features:**
- Create/edit sets (series with configurable pitch class of C)
- Create/edit matrix transformations for each set
- View matrices in standard or Stravinsky format
- Switch display between pitch class numbers and note names
- Analyze series properties (interval vectors, combinatoriality, hexachord info)
- Print matrices
- Auto-save to localStorage

## Data Model

See `src/lib/types.ts`:

```ts
interface SetData {
  id: string
  title: string
  seriesInput: string           // Raw user input (e.g. "0 11 3 4 8...")
  pitchClassOfC: number         // 0–11; controls pitch class ↔ note name mapping
  matrices: MatrixData[]
}

interface MatrixData {
  id: string
  name: string
  transform: MatrixTransform    // Invert, multiplier, rotation, transpose
  stravinskyVerticals: boolean
  displayType: 'numbers' | 'noteNames'
  accidentals: 'sharps' | 'flats'  // flats use Unicode ♭ (D♭, E♭, G♭, A♭, B♭)
}

type AppState = { sets: SetData[] }
```

## State Management

`src/lib/state.svelte.ts` uses Svelte 5 runes for reactive state:

```ts
export const appState: AppState = $state(loadInitialState())
```

Initialization:
- If `localStorage` exists: loads saved state
- Otherwise: empty state `{ sets: [] }`

Auto-save:
- `src/routes/+layout.svelte` has `$effect(() => saveState())` which tracks all reads on
  `appState` via Svelte's proxy-based reactivity
- When any part of state changes, effect re-runs and persists to localStorage

Import/Export:
- **Export**: Downloads a `.json` file of the entire `appState`
- **Import**: User uploads a `.json` file; replaces `appState.sets` and re-saves

CRUD helpers in `state.svelte.ts`:
- `createSet(title, seriesInput, pitchClassOfC): SetData`
- `updateSet(id, patch): void`
- `deleteSet(id): void`
- `createMatrix(setId, data): MatrixData`
- `updateMatrix(setId, matrixId, patch): void`
- `deleteMatrix(setId, matrixId): void`

## Routes

### `/` — Sets List

**File**: `src/routes/+page.svelte`

Shows all sets as clickable cards. Each card displays:
- Set title
- Series input string (truncated if long)
- Number of matrices

Actions:
- Click card → navigate to set detail
- Edit button → open `SetDialog` with current values
- Delete button → confirm and remove set

### `/sets/[setId]` — Set Detail

**File**: `src/routes/sets/[setId]/+page.svelte`

Displays a single set:
- Breadcrumb navigation
- Set title (editable via "Edit" button)
- Full series input and pitch class of C info
- List of matrices for this set

Actions:
- Edit button → open `SetDialog`
- New Matrix button → open `MatrixDialog` with empty form
- Each matrix row can be clicked to view the matrix
- Edit/Delete buttons on each matrix

When creating a matrix, auto-navigates to the matrix view.

### `/sets/[setId]/matrices/[matrixId]` — Matrix View

**File**: `src/routes/sets/[setId]/matrices/[matrixId]/+page.svelte`

**Two tabs:**

#### Matrix tab

**Page header** (above the tabs) shows:
- Left: matrix name (h1) and full transform description
- Right: info panel with three rows — Original series, Altered series (after transform),
  and Transform (concise label, e.g. `I · M5 · R3`). Series values respect the current
  `displayType` / `accidentals` settings.

**Toolbar** (display options, hidden on print):
- Radio buttons: Numbers / Note Names
- (If Note Names selected) Radio buttons: Sharps / Flats
- Checkbox: Stravinsky Verticals (affects row/column computation)
- Print button

**`MatrixGrid`** renders the matrix table.  All display changes persist immediately to `appState`.

Print CSS hides the toolbar and navigation; only the grid prints.

#### Analysis tab

Calls `analyzeSeries()` on the original series and displays:
- **Set Properties**: all-interval badge or adjacency interval histogram; degenerate form if present
- **Hexachordal**: hexachord #, combinatoriality type, properties, combinatorial forms, interval vectors
- **Tetrachordal/Trichordal/Dyadic**: combinatoriality classes and generator (only if present)

See `docs/analysis.md` for analysis details.

## Components

### SetDialog.svelte

Modal dialog for creating or editing a set.

**Props:**
- `set?: SetData | null` — if null, dialog is for creating a new set
- `onconfirm: (data) => void` — called when user clicks Confirm
- `oncancel: () => void` — called when user closes or clicks Cancel

**Features:**
- Title input field
- Series input field with **live parsing**:
  - Accepts space/comma/tab-separated pitch class numbers (0–11)
  - Accepts note names: C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B
  - Note names are transposed by `pitchClassOfC` during parsing
  - Shows error inline if series is invalid (repeated pitch, invalid token)
  - Shows "(N pitches)" hint if valid
- Pitch class of C selector (0–11 with note name labels)
- Confirm/Cancel buttons; Confirm disabled if data is invalid

Uses `<dialog>` element; opens automatically when mounted via `dialog.showModal()`.

### MatrixDialog.svelte

Modal dialog for creating or editing a matrix transformation.

**Props:**
- `matrix?: MatrixData | null` — if null, dialog is for creating
- `seriesInput: string` — the series to transform (for preview)
- `pitchClassOfC: number` — for display preview
- `onconfirm: (data) => void`
- `oncancel: () => void`

**Features:**
- Name field: auto-populated from `matrixTransformLabel`, editable
- Transform controls:
  - Invert checkbox
  - Multiplier select (None/M5/M7/M11)
  - Rotation select (0–11)
  - Intra-hexachordal checkbox
  - Transpose toggle + pitch class picker (0–11)
- Display options:
  - Numbers / Note Names radio
  - Sharps / Flats radio (only if note names)
  - Stravinsky Verticals checkbox
- **Live preview**: displays transformed series and first row of matrix as user adjusts settings

Name field tracking: initially syncs to auto-label; once user types, stays independent.

### MatrixGrid.svelte

Renders a matrix as an HTML `<table>`.

**Props:**
- `matrix: Matrix` — from `buildMatrix()`
- `displayType: 'numbers' | 'noteNames'`
- `accidentals: 'sharps' | 'flats'`
- `pitchClassOfC: number`
- `showSetForms?: boolean` — feature flag (default `false`); when `true` renders S/I-form
  labels on the row/column edges
- `intraHexachordal?: boolean` — when `true` draws double-line dividers at the midpoint of
  rows and columns, splitting the grid into quadrants

**Visual design:**
- Square cells (2.5 rem × 2.5 rem), 1 px inner borders, 2 px outer border (via wrapper div)
- Intra-hexachordal split: CSS `3px double` border = two 1 px lines + 1 px gap
- Standard (non-Stravinsky) path: 12×12 grid → 4 × 6×6 quadrants
- Stravinsky path: 6×12 grid → 2 × 6×6 side by side (column split only, no row split)

**Important**: `matrix.rowCount` is `6` for intra-hexachordal even in the standard path where
`matrix.entries` has 12 rows. Always use `matrix.entries.length` for the actual row count.

### AnalysisPanel.svelte

Displays comprehensive analysis of a series.

**Props:**
- `series: Series`
- `pitchClassOfC: number`

**Sections:**

1. **Set Properties**
   - All-interval series badge (green)
   - OR adjacency interval histogram (intervals 1–11 with counts)
   - Degenerate form badge if present (amber)

2. **Hexachordal** (if hex analysis available)
   - Hexachord # and combinatoriality type (e.g. "1st-order all-combinatorial")
   - Properties badges (IE, SI, ST)
   - Combinatorial forms as badges (set form labels)
   - Interval vectors for both hexachords

3. **Tetrachordal / Trichordal / Dyadic** (only if combinatoriality classes exist)
   - Lists each combinatoriality class as a set of form groups
   - Generator series if present

All badges use distinct color schemes for visual hierarchy.

## Styling

No CSS framework — all vanilla CSS with:
- System font stack (`system-ui, -apple-system, sans-serif`)
- Simple flexbox layouts
- Monospace font for pitch classes and matrices
- Soft borders and light backgrounds
- Print CSS hides nav/toolbar/tabs; only matrix grid prints

## Data Flow

```
User creates/edits set
        ↓
SetDialog component
        ↓
onconfirm → calls createSet() or updateSet()
        ↓
appState updates (reactive)
        ↓
$effect in +layout.svelte detects change
        ↓
saveState() writes to localStorage
        ↓
Page navigates to /sets/[setId]
```

Similar flow for matrices:
```
User opens matrix dialog
        ↓
MatrixDialog shows live preview
        ↓
User confirms
        ↓
createMatrix() or updateMatrix()
        ↓
appState updates, localStorage persists
        ↓
Navigate to /sets/[setId]/matrices/[matrixId]
        ↓
Matrix page renders grid + analysis
        ↓
User adjusts display options (Numbers/Note Names, etc.)
        ↓
updateMatrix() updates displayType/accidentals/stravinskyVerticals
        ↓
Reactive re-render; localStorage persists
```

## Accessibility Notes

- Modal dialogs use native `<dialog>` element
- Keyboard support: Escape to close dialogs
- Form inputs have `<label>` elements (for SetDialog and MatrixDialog)
- Matrix grid uses `<table>` for semantic HTML
- Print stylesheet respected by browsers
- Color is not the only indicator (badges have text labels, icons where used)
