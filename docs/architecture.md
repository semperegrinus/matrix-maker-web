# Architecture

## Stack

SvelteKit 5 + TypeScript, built with Vite. Package manager: pnpm.

## Directory layout

```
src/
  routes/          # SvelteKit pages (+page.svelte, +layout.svelte)
  lib/
    assets/        # Static data files (hexachords.json)
    music/         # All domain logic — pure TypeScript, no Svelte dependency
    index.ts       # Re-exports everything from lib/music/index.ts
```

## Domain / UI boundary

`src/lib/music/` is framework-agnostic. Every function is pure (no side effects,
no global state except the hexachord DB Map built at module init). UI components
in `src/routes/` import from `$lib` and call into these functions.

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

Tests are collocated: `*.test.ts` beside each module. Run with `npx vitest run --project server`.
The `client` vitest project requires Playwright — only needed for Svelte component tests.
