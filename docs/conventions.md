# Conventions

## Arithmetic

- **Always use `pc(n)`** for mod-12. JS `%` returns negative for negative inputs.
  `pc` is `((n % 12) + 12) % 12`.
- Chord bitmask iteration: loop `i` from 0 to 11, test `chord & (1 << i)`.

## Types

- No branded types. `PitchClass` and `IntervalClass` are both `number` aliases —
  used for documentation only, not enforced at runtime.
- `Series = PitchClass[]`. `Chord = number` (bitmask).

## Formatting

- Prettier: tabs, single quotes, 100-char print width, no trailing commas.
- Run `pnpm format` to auto-fix, `pnpm lint` to check (also runs ESLint).
- ESLint uses flat config (`eslint.config.js`), TypeScript + Svelte plugins.

## Testing

- Tests collocated with source: `foo.ts` → `foo.test.ts`.
- Run only server-side (Node) tests: `npx vitest run --project server`
  (avoids Playwright dependency for pure logic tests).
- Full suite: `pnpm test:unit -- --run` (requires Playwright for client project).

## Imports

- Use `.js` extensions in relative imports (required for ESM): `import { pc } from './pitch.js'`.
- Type-only imports use `import type` to avoid circular runtime dependencies.
- JSON: `import hexaData from '$lib/assets/hexachords.json'` — resolveJsonModule is on.

## Pure functions

All `src/lib/music/` functions are pure and stateless except the two Maps in
`hexachordDb.ts` (built once at module init, never mutated).
