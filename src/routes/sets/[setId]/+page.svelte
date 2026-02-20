<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		appState,
		createMatrix,
		deleteMatrix,
		updateMatrix,
		updateSet
	} from '$lib/state.svelte.js';
	import SetDialog from '$lib/components/SetDialog.svelte';
	import MatrixDialog from '$lib/components/MatrixDialog.svelte';
	import { matrixTransformLabel } from '$lib/music/matrixTransform.js';
	import { parseSeries, isParseError } from '$lib/music/series.js';
	import { pitchName } from '$lib/music/pitch.js';
	import type { MatrixData } from '$lib/types.js';

	const setId = $derived($page.params.setId);
	const set = $derived(appState.sets.find((s) => s.id === setId) ?? null);

	const parsedSeries = $derived(
		set
			? (() => {
					const r = parseSeries(set.seriesInput, set.pitchClassOfC);
					return isParseError(r) ? null : r;
				})()
			: null
	);

	let editSetOpen = $state(false);
	let matrixDialogOpen = $state(false);
	let editingMatrix = $state<MatrixData | null>(null);

	function openNewMatrix() {
		editingMatrix = null;
		matrixDialogOpen = true;
	}

	function openEditMatrix(m: MatrixData) {
		editingMatrix = m;
		matrixDialogOpen = true;
	}

	function handleSetConfirm(data: { title: string; seriesInput: string; pitchClassOfC: number }) {
		if (!set) return;
		updateSet(set.id, data);
		editSetOpen = false;
	}

	function handleMatrixConfirm(data: Omit<MatrixData, 'id'>) {
		if (!set) return;
		if (editingMatrix) {
			updateMatrix(set.id, editingMatrix.id, data);
			matrixDialogOpen = false;
		} else {
			const m = createMatrix(set.id, data);
			matrixDialogOpen = false;
			goto(`/sets/${set.id}/matrices/${m.id}`);
		}
	}
</script>

{#if !set}
	<p>Set not found. <a href="/">Go home</a></p>
{:else}
	<div class="breadcrumb">
		<a href="/">Sets</a> / <span>{set.title}</span>
	</div>

	<div class="page-header">
		<h1>{set.title}</h1>
		<button class="btn-text" onclick={() => (editSetOpen = true)}>✎ Edit</button>
	</div>

	<div class="set-info">
		<span class="label">Series</span>
		<span class="series-display">{set.seriesInput}</span>
		{#if parsedSeries}
			<span class="meta">({parsedSeries.length} pitches)</span>
		{/if}
		{#if set.pitchClassOfC !== 0}
			<span class="meta">C = {set.pitchClassOfC} ({pitchName(0, { pitchClassOfC: set.pitchClassOfC })})</span>
		{/if}
	</div>

	<div class="section-header">
		<h2>Matrices</h2>
		<button class="btn-primary" onclick={openNewMatrix}>+ New Matrix</button>
	</div>

	{#if set.matrices.length === 0}
		<p class="empty">No matrices yet. Click "New Matrix" to create one.</p>
	{:else}
		<ul class="matrix-list">
			{#each set.matrices as matrix (matrix.id)}
				<li class="matrix-row">
					<a href="/sets/{set.id}/matrices/{matrix.id}" class="matrix-link">
						<span class="matrix-name">{matrix.name}</span>
						<span class="matrix-transform">{matrixTransformLabel(matrix.transform)}</span>
						<span class="matrix-meta">
							{matrix.displayType === 'noteNames' ? 'Note names' : 'Numbers'}
							{#if matrix.stravinskyVerticals}· Stravinsky{/if}
						</span>
					</a>
					<div class="matrix-actions">
						<button class="btn-icon" onclick={() => openEditMatrix(matrix)} title="Edit">✎</button>
						<button
							class="btn-icon danger"
							onclick={() => {
								if (confirm(`Delete matrix "${matrix.name}"?`)) deleteMatrix(set.id, matrix.id);
							}}
							title="Delete">✕</button
						>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

{#if editSetOpen && set}
	<SetDialog set={set} onconfirm={handleSetConfirm} oncancel={() => (editSetOpen = false)} />
{/if}

{#if matrixDialogOpen && set}
	<MatrixDialog
		matrix={editingMatrix}
		seriesInput={set.seriesInput}
		pitchClassOfC={set.pitchClassOfC}
		onconfirm={handleMatrixConfirm}
		oncancel={() => (matrixDialogOpen = false)}
	/>
{/if}

<style>
	.breadcrumb {
		font-size: 0.85rem;
		color: #888;
		margin-bottom: 0.75rem;
	}

	.breadcrumb a {
		color: #1a73e8;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.4rem;
	}

	h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.set-info {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.label {
		font-size: 0.8rem;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.series-display {
		font-family: monospace;
		font-size: 0.9rem;
		color: #333;
	}

	.meta {
		font-size: 0.8rem;
		color: #888;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.btn-primary {
		padding: 0.4rem 1rem;
		background: #1a73e8;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: #1558b0;
	}

	.btn-text {
		padding: 0.25rem 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		font-size: 0.85rem;
		color: #555;
		cursor: pointer;
	}

	.btn-text:hover {
		background: #f5f5f5;
	}

	.empty {
		color: #888;
		font-size: 0.95rem;
	}

	.matrix-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.matrix-row {
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		overflow: hidden;
	}

	.matrix-link {
		flex: 1;
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.65rem 1rem;
		color: inherit;
		text-decoration: none;
	}

	.matrix-link:hover {
		background: #f5f5f5;
	}

	.matrix-name {
		font-weight: 600;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.matrix-transform {
		font-size: 0.85rem;
		color: #555;
		flex: 1;
	}

	.matrix-meta {
		font-size: 0.8rem;
		color: #888;
		white-space: nowrap;
	}

	.matrix-actions {
		display: flex;
		gap: 0.25rem;
		padding: 0 0.5rem;
	}

	.btn-icon {
		padding: 0.3rem 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.9rem;
		color: #666;
		border-radius: 3px;
	}

	.btn-icon:hover {
		background: #f0f0f0;
		color: #333;
	}

	.btn-icon.danger:hover {
		background: #fce8e6;
		color: #c00;
	}
</style>
