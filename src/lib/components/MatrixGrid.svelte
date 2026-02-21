<script lang="ts">
	import { pitchName } from '$lib/music/pitch.js';
	import { setFormLabel } from '$lib/music/setForm.js';
	import type { Matrix } from '$lib/music/matrix.js';

	interface Props {
		matrix: Matrix;
		displayType: 'numbers' | 'noteNames';
		accidentals: 'sharps' | 'flats';
		pitchClassOfC: number;
		showSetForms?: boolean;
		intraHexachordal?: boolean;
	}

	let {
		matrix,
		displayType,
		accidentals,
		pitchClassOfC,
		showSetForms = false,
		intraHexachordal = false
	}: Props = $props();

	function display(p: number): string {
		if (displayType === 'noteNames') {
			return pitchName(p, { pitchClassOfC, accidentals });
		}
		return String(p);
	}

	// Row labels: S{entries[i][0]}, column labels: I{entries[0][j]}
	const rowLabels = $derived(
		matrix.entries.map((row) => setFormLabel({ kind: 'S', base: row[0] }))
	);
	const colLabels = $derived(
		matrix.entries[0]?.map((p) => setFormLabel({ kind: 'I', base: p })) ?? []
	);

	// Index of the last cell before the hexachordal midpoint split.
	// Only split rows when the matrix is square (standard path: 12×12).
	// With Stravinsky verticals the matrix is 6×12, so only the column split applies.
	const splitRow = $derived(
		intraHexachordal && matrix.entries.length === matrix.columnCount
			? Math.floor(matrix.entries.length / 2) - 1
			: -1
	);
	const splitCol = $derived(intraHexachordal ? Math.floor(matrix.columnCount / 2) - 1 : -1);
</script>

<div class="matrix-wrapper">
	<div class="matrix-outer">
		<table class="matrix-table">
			{#if showSetForms}
				<thead>
					<tr>
						<th class="corner"></th>
						{#each colLabels as label, j}
							<th class="col-label" class:split-right={j === splitCol}>{label}</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				{#each matrix.entries as row, i}
					<tr>
						{#if showSetForms}
							<th class="row-label" class:split-bottom={i === splitRow}>{rowLabels[i]}</th>
						{/if}
						{#each row as pitch, j}
							<td
								class="cell"
								class:split-right={j === splitCol}
								class:split-bottom={i === splitRow}
							>{display(pitch)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.matrix-wrapper {
		overflow-x: auto;
	}

	/* Provides the 2px outer border without doubling the outer cell edges */
	.matrix-outer {
		border: 2px solid #555;
		width: fit-content;
	}

	.matrix-table {
		border-collapse: collapse;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.corner {
		background: transparent;
	}

	.col-label {
		text-align: center;
		padding: 0.2rem 0.4rem;
		font-size: 0.75rem;
		color: #666;
		font-family: sans-serif;
		font-weight: 600;
		border: none;
	}

	.row-label {
		text-align: right;
		padding: 0.2rem 0.5rem 0.2rem 0;
		font-size: 0.75rem;
		color: #666;
		font-family: sans-serif;
		font-weight: 600;
		white-space: nowrap;
		border: none;
	}

	.cell {
		text-align: center;
		vertical-align: middle;
		border: 1px solid #ddd;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
	}

	/*
	 * Remove the outer edges of the outermost cells so the .matrix-outer border
	 * serves cleanly as the 2px outer border (no double-border effect).
	 */
	.matrix-table tbody tr:first-child td {
		border-top: none;
	}
	.matrix-table tbody tr:last-child td {
		border-bottom: none;
	}
	.matrix-table tbody tr td:first-child {
		border-left: none;
	}
	.matrix-table tbody tr td:last-child {
		border-right: none;
	}

	/*
	 * Intra-hexachordal split: CSS `double` at 3px = two 1px lines + 1px gap.
	 * Higher specificity than the outer-edge removals above so these always show.
	 */
	.matrix-table .cell.split-right {
		border-right: 3px double #999;
	}
	.matrix-table .cell.split-bottom {
		border-bottom: 3px double #999;
	}

	@media print {
		.matrix-table {
			font-size: 0.8rem;
		}
	}
</style>
