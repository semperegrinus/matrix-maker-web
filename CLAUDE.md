# Matrix Maker Web

Description: Web interface for the analysis and visualization of
12-tone series and their transformations.

Written in Svelte+TypeScript using pnpm.

## Basic user flow:

- user creates a set (usually corresponding to a single piece of music)
- user creates a new transformation/visualization/analysis for that set
- user views transformed set as a matrix with supplemental analysis

### Transformations

- M5/M7 transform
- Rotations (full, intra-hexachordal, intra-tetrachordal, intra-trichordal)
- Intrahexachordal rotation
- Transpositions

### Matrix options

- Stravinsky verticals
- View as numbers/pitch classes
  - pitch class for 0

### Analysis options

Analysis determines set properties for full 12-tone sets.
It determines things like the interval vector and the set's combinatoriality:

- Hexachordal combinatoriality (if any)
- Tetrachordal combinatoriality (if any)
- Trichordal combinatoriality (if any)
