# Architecture

## Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Build**: Vite
- **Package manager**: pnpm
- **Static adapter**: `@sveltejs/adapter-static` with `fallback: 404.html` (SPA mode)
- **Persistence**: localStorage for auto-save; JSON import/export via UI

## Directory layout

```
src/
  routes/
    +layout.svelte              # App header, Import/Export buttons, auto-save
    +page.svelte                # Sets list
    sets/[setId]/
      +page.svelte              # Set detail: series info, matrices list
      matrices/[matrixId]/
        +page.svelte            # Matrix view: grid + analysis tabs
  lib/
    assets/                      # Static data files (hexachords.json)
    music/                       # All domain logic — pure TypeScript, no Svelte dependency
    types.ts                     # AppState, SetData, MatrixData
    state.svelte.ts             # Reactive state with localStorage persistence
    components/                  # Svelte UI components
      SetDialog.svelte
      MatrixDialog.svelte
      MatrixGrid.svelte
      AnalysisPanel.svelte
    index.ts                     # Re-exports everything from lib/music/index.ts
```

## Domain / UI boundary

`src/lib/music/` is framework-agnostic. Every function is pure (no side effects,
no global state except the hexachord DB Map built at module init).

UI is split into:
- **Routes** (`src/routes/`) — SvelteKit page components that handle navigation and layout
- **Components** (`src/lib/components/`) — reusable Svelte 5 components (dialogs, grid, analysis panel)
- **State** (`src/lib/state.svelte.ts`) — reactive app state with localStorage persistence

Both routes and components import from `$lib/music` and call domain functions directly.

## Import alias

`$lib` resolves to `src/lib/`. Use `$lib/music/...` for direct module imports or
`$lib` for the barrel export. JSON assets import as `$lib/assets/hexachords.json`
(resolveJsonModule is enabled).

## Module dependency order

```
pitch  ←  chord  ←  intervalVector
                ←  series  ←  setForm  ←  matrixTransform  ←  matrix
                                       ←  hexachordDb
                                       ←  analysis
```

`series.ts` imports `SetForm` as a **type only** (no runtime circular dependency).
`seriesDegenerateForm` inlines its R/RI logic rather than calling `applySetForm`.

## Testing

Tests are collocated: `*.test.ts` beside each module. Run with `pnpm test:unit`.
All tests are **domain-focused** (music logic in `src/lib/music/`). UI components
(routes, dialogs, grids) are not tested — the focus is on correctness of the music
transformations, analyses, and parsing.
