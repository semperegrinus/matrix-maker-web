<script lang="ts">
	import { pitchName } from '$lib/music/pitch.js';
	import { setFormLabel } from '$lib/music/setForm.js';
	import type { Matrix } from '$lib/music/matrix.js';

	interface Props {
		matrix: Matrix;
		displayType: 'numbers' | 'noteNames';
		accidentals: 'sharps' | 'flats';
		pitchClassOfC: number;
	}

	let { matrix, displayType, accidentals, pitchClassOfC }: Props = $props();

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
</script>

<div class="matrix-wrapper">
	<table class="matrix-table">
		<thead>
			<tr>
				<th class="corner"></th>
				{#each colLabels as label}
					<th class="col-label">{label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each matrix.entries as row, i}
				<tr>
					<th class="row-label">{rowLabels[i]}</th>
					{#each row as pitch}
						<td class="cell">{display(pitch)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.matrix-wrapper {
		overflow-x: auto;
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
	}

	.row-label {
		text-align: right;
		padding: 0.2rem 0.5rem 0.2rem 0;
		font-size: 0.75rem;
		color: #666;
		font-family: sans-serif;
		font-weight: 600;
		white-space: nowrap;
	}

	.cell {
		text-align: center;
		padding: 0.3rem 0.5rem;
		border: 1px solid #e0e0e0;
		min-width: 2rem;
	}

	@media print {
		.matrix-table {
			font-size: 0.8rem;
		}
	}
</style>
