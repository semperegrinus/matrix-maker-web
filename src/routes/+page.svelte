<script lang="ts">
	import { appState, createSet, deleteSet, updateSet } from '$lib/state.svelte.js';
	import SetDialog from '$lib/components/SetDialog.svelte';
	import type { SetData } from '$lib/types.js';

	let dialogOpen = $state(false);
	let editingSet = $state<SetData | null>(null);

	function openNewSet() {
		editingSet = null;
		dialogOpen = true;
	}

	function openEditSet(set: SetData) {
		editingSet = set;
		dialogOpen = true;
	}

	function handleConfirm(data: { title: string; seriesInput: string; pitchClassOfC: number }) {
		if (editingSet) {
			updateSet(editingSet.id, data);
		} else {
			createSet(data.title, data.seriesInput, data.pitchClassOfC);
		}
		dialogOpen = false;
	}
</script>

<div class="page-header">
	<h1>Sets</h1>
	<button class="btn-primary" onclick={openNewSet}>+ New Set</button>
</div>

{#if appState.sets.length === 0}
	<p class="empty">No sets yet. Click "New Set" to get started.</p>
{:else}
	<ul class="set-list">
		{#each appState.sets as set (set.id)}
			<li class="set-card">
				<a href="/sets/{set.id}" class="set-link">
					<span class="set-title">{set.title}</span>
					<span class="set-series">{set.seriesInput}</span>
					<span class="set-meta">{set.matrices.length} matrix{set.matrices.length === 1 ? '' : 'es'}</span>
				</a>
				<div class="set-actions">
					<button class="btn-icon" onclick={() => openEditSet(set)} title="Edit set">✎</button>
					<button
						class="btn-icon danger"
						onclick={() => {
							if (confirm(`Delete "${set.title}"?`)) deleteSet(set.id);
						}}
						title="Delete set">✕</button
					>
				</div>
			</li>
		{/each}
	</ul>
{/if}

{#if dialogOpen}
	<SetDialog set={editingSet} onconfirm={handleConfirm} oncancel={() => (dialogOpen = false)} />
{/if}

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: 1.4rem;
	}

	.btn-primary {
		padding: 0.45rem 1.1rem;
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

	.empty {
		color: #888;
		font-size: 0.95rem;
	}

	.set-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.set-card {
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		overflow: hidden;
	}

	.set-link {
		flex: 1;
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: inherit;
		text-decoration: none;
	}

	.set-link:hover {
		background: #f5f5f5;
		text-decoration: none;
	}

	.set-title {
		font-weight: 600;
		font-size: 0.95rem;
		white-space: nowrap;
	}

	.set-series {
		font-family: monospace;
		font-size: 0.85rem;
		color: #555;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.set-meta {
		font-size: 0.8rem;
		color: #888;
		white-space: nowrap;
	}

	.set-actions {
		display: flex;
		gap: 0.25rem;
		padding: 0 0.5rem;
	}

	.btn-icon {
		padding: 0.3rem 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.95rem;
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
