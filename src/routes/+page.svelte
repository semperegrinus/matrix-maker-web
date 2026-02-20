<script lang="ts">
	import {
		appState,
		createSet,
		createMatrix,
		deleteSet,
		deleteMatrix,
		updateSet,
		updateMatrix
	} from '$lib/state.svelte.js';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import SetDialog from '$lib/components/SetDialog.svelte';
	import MatrixDialog from '$lib/components/MatrixDialog.svelte';
	import { matrixTransformLabel } from '$lib/music/matrixTransform.js';
	import { Copy, Trash2, PencilIcon, ChevronRight, ChevronDown, Plus } from 'lucide-svelte';
	import { session } from '$lib/session.svelte.js';
	import type { SetData, MatrixData } from '$lib/types.js';

	// Set dialog state
	let setDialogOpen = $state(false);
	let duplicatingSet = $state<SetData | null>(null);

	// Title editing state
	let editingTitleSetId = $state<string | null>(null);
	let editingTitleValue = $state('');


	// Matrix dialog state
	let matrixDialogSetId = $state<string | null>(null);
	let editingMatrix = $state<MatrixData | null>(null);

	const matrixDialogSet = $derived(
		matrixDialogSetId ? (appState.sets.find((s) => s.id === matrixDialogSetId) ?? null) : null
	);

	// Sort helpers — most recently viewed first, unviewed items at the end
	function latestMatrixView(set: SetData): number {
		let max = 0;
		for (const m of set.matrices) {
			if (m.lastViewedAt && m.lastViewedAt > max) max = m.lastViewedAt;
		}
		return max;
	}

	const sortedSets = $derived(
		[...appState.sets].sort((a, b) => latestMatrixView(b) - latestMatrixView(a))
	);

	function sortedMatrices(set: SetData): MatrixData[] {
		return [...set.matrices].sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0));
	}

	// ---- Set actions ----

	function openNewSet() {
		duplicatingSet = null;
		setDialogOpen = true;
	}

	function openDuplicateSet(set: SetData) {
		duplicatingSet = set;
		setDialogOpen = true;
	}

	function handleSetConfirm(data: { title: string; seriesInput: string; pitchClassOfC: number }) {
		const newSet = createSet(data.title, data.seriesInput, data.pitchClassOfC);
		session.expandedSetId = newSet.id;
		setDialogOpen = false;
	}

	// ---- Title editing ----

	function startEditingTitle(set: SetData) {
		editingTitleSetId = set.id;
		editingTitleValue = set.title;
	}

	function saveTitle(id: string) {
		const trimmed = editingTitleValue.trim();
		if (trimmed) updateSet(id, { title: trimmed });
		editingTitleSetId = null;
	}

	function cancelEditingTitle() {
		editingTitleSetId = null;
	}

	function handleTitleKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter') saveTitle(id);
		else if (e.key === 'Escape') cancelEditingTitle();
	}

	// ---- Matrix actions ----

	function openNewMatrix(setId: string) {
		matrixDialogSetId = setId;
		editingMatrix = null;
	}

	function openEditMatrix(setId: string, matrix: MatrixData) {
		matrixDialogSetId = setId;
		editingMatrix = matrix;
	}

	function handleMatrixConfirm(data: Omit<MatrixData, 'id'>) {
		if (!matrixDialogSetId) return;
		if (editingMatrix) {
			updateMatrix(matrixDialogSetId, editingMatrix.id, data);
		} else {
			const m = createMatrix(matrixDialogSetId, data);
			goto(`${base}/sets/${matrixDialogSetId}/matrices/${m.id}`);
		}
		matrixDialogSetId = null;
		editingMatrix = null;
	}

	function cancelMatrixDialog() {
		matrixDialogSetId = null;
		editingMatrix = null;
	}

	function toggleSet(setId: string) {
		session.expandedSetId = session.expandedSetId === setId ? null : setId;
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
		{#each sortedSets as set (set.id)}
			{@const expanded = session.expandedSetId === set.id}
			<li class="set-card" class:expanded>
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<div
					class="set-header"
					role="button"
					tabindex="0"
					onclick={() => toggleSet(set.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggleSet(set.id);
						}
					}}
				>
					<span class="chevron" aria-hidden="true">
						{#if expanded}
							<ChevronDown size={16} />
						{:else}
							<ChevronRight size={16} />
						{/if}
					</span>

					{#if editingTitleSetId === set.id}
						<!-- svelte-ignore a11y_autofocus -->
						<input
							type="text"
							bind:value={editingTitleValue}
							onblur={() => saveTitle(set.id)}
							onkeydown={(e) => {
								e.stopPropagation();
								handleTitleKeydown(e, set.id);
							}}
							onclick={(e) => e.stopPropagation()}
							class="title-input"
							autofocus
						/>
					{:else}
						<span class="set-title-wrapper">
							<span class="set-title">{set.title}</span>
							<button
								class="btn-edit-title"
								onclick={(e) => {
									e.stopPropagation();
									startEditingTitle(set);
								}}
								title="Edit title"
								aria-label="Edit title">
								<PencilIcon size={14} />
							</button>
						</span>
					{/if}

					<span class="set-series">{set.seriesInput}</span>
					<span class="set-meta"
						>{set.matrices.length} matrix{set.matrices.length === 1 ? '' : 'es'}</span
					>

					<div class="set-actions">
						<button
							class="btn-icon"
							onclick={(e) => {
								e.stopPropagation();
								openDuplicateSet(set);
							}}
							title="Duplicate set"
							aria-label="Duplicate set">
							<Copy size={16} />
						</button>
						<button
							class="btn-icon danger"
							onclick={(e) => {
								e.stopPropagation();
								if (confirm(`Delete "${set.title}"?`)) deleteSet(set.id);
							}}
							title="Delete set"
							aria-label="Delete set">
							<Trash2 size={16} />
						</button>
					</div>
				</div>

				{#if expanded}
					<div class="set-matrices">
						{#if set.matrices.length === 0}
							<p class="empty-matrices">No matrices yet.</p>
						{:else}
							<ul class="matrix-list">
								{#each sortedMatrices(set) as matrix (matrix.id)}
									<li class="matrix-row">
										<a
											href="{base}/sets/{set.id}/matrices/{matrix.id}"
											class="matrix-link"
										>
											<span class="matrix-name">{matrix.name}</span>
											<span class="matrix-transform"
												>{matrixTransformLabel(matrix.transform)}</span
											>
											<span class="matrix-meta">
												{matrix.displayType === 'noteNames' ? 'Note names' : 'Numbers'}
												{#if matrix.stravinskyVerticals}· Stravinsky{/if}
											</span>
										</a>
										<div class="matrix-actions">
											<button
												class="btn-icon"
												onclick={() => openEditMatrix(set.id, matrix)}
												title="Edit matrix"
												aria-label="Edit matrix">
												<PencilIcon size={14} />
											</button>
											<button
												class="btn-icon danger"
												onclick={() => {
													if (confirm(`Delete matrix "${matrix.name}"?`))
														deleteMatrix(set.id, matrix.id);
												}}
												title="Delete matrix"
												aria-label="Delete matrix">
												<Trash2 size={14} />
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
						<div class="matrix-footer">
							<button class="btn-new-matrix" onclick={() => openNewMatrix(set.id)}>
								<Plus size={14} />New Matrix
							</button>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

{#if setDialogOpen}
	<SetDialog
		duplicatingSet={duplicatingSet}
		onconfirm={handleSetConfirm}
		oncancel={() => (setDialogOpen = false)}
	/>
{/if}

{#if matrixDialogSet}
	<MatrixDialog
		matrix={editingMatrix}
		seriesInput={matrixDialogSet.seriesInput}
		pitchClassOfC={matrixDialogSet.pitchClassOfC}
		setTitle={matrixDialogSet.title}
		onconfirm={handleMatrixConfirm}
		oncancel={cancelMatrixDialog}
	/>
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
		flex-direction: column;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
	}

	.set-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		border-radius: 6px;
		user-select: none;
	}

	.set-card.expanded .set-header {
		border-bottom: 1px solid #e8e8e8;
		border-radius: 6px 6px 0 0;
	}

	.set-header:hover {
		background: #f5f5f5;
	}

	.chevron {
		display: flex;
		align-items: center;
		color: #aaa;
		flex-shrink: 0;
	}

	.set-title-wrapper {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.set-title {
		font-weight: 600;
		font-size: 0.95rem;
		white-space: nowrap;
	}

	.btn-edit-title {
		padding: 0.2rem;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #999;
		border-radius: 2px;
		opacity: 0;
		transition: opacity 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.set-title-wrapper:hover .btn-edit-title {
		opacity: 1;
	}

	.btn-edit-title:hover {
		background: #e8e8e8;
		color: #333;
	}

	.title-input {
		padding: 0.3rem 0.5rem;
		border: 1px solid #1a73e8;
		border-radius: 3px;
		font-size: 0.95rem;
		font-weight: 600;
		font-family: inherit;
		flex-shrink: 0;
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
		margin-left: 0.25rem;
	}

	.btn-icon {
		padding: 0.35rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: #666;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover {
		background: #f0f0f0;
		color: #333;
	}

	.btn-icon.danger:hover {
		background: #fce8e6;
		color: #c00;
	}

	/* Expanded matrices section */

	.set-matrices {
		padding: 0.6rem 1rem 0.75rem;
	}

	.empty-matrices {
		color: #888;
		font-size: 0.85rem;
		margin: 0 0 0.5rem;
	}

	.matrix-list {
		list-style: none;
		margin: 0 0 0.5rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.matrix-row {
		display: flex;
		align-items: center;
		background: #f8f9fa;
		border: 1px solid #e8e8e8;
		border-radius: 4px;
	}

	.matrix-link {
		flex: 1;
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		color: inherit;
		text-decoration: none;
	}

	.matrix-link:hover {
		background: #eff1f3;
		border-radius: 4px 0 0 4px;
	}

	.matrix-name {
		font-weight: 600;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.matrix-transform {
		font-size: 0.83rem;
		color: #555;
		flex: 1;
	}

	.matrix-meta {
		font-size: 0.78rem;
		color: #888;
		white-space: nowrap;
	}

	.matrix-actions {
		display: flex;
		gap: 0.15rem;
		padding: 0 0.25rem;
	}

	.matrix-footer {
		display: flex;
		justify-content: flex-end;
	}

	.btn-new-matrix {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.75rem;
		background: #1a73e8;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 0.85rem;
		cursor: pointer;
		font-family: inherit;
	}

	.btn-new-matrix:hover {
		background: #1558b0;
	}
</style>
