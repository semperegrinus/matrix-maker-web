<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { appState, updateMatrix, recordMatrixView } from '$lib/state.svelte.js';
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import AnalysisPanel from '$lib/components/AnalysisPanel.svelte';
	import { parseSeries, isParseError } from '$lib/music/series.js';
	import { buildMatrix } from '$lib/music/matrix.js';
	import { applyMatrixTransform, matrixTransformConciseLabel } from '$lib/music/matrixTransform.js';
	import { pitchName } from '$lib/music/pitch.js';

	const setId = $derived($page.params.setId);
	const matrixId = $derived($page.params.matrixId);

	const set = $derived(appState.sets.find((s) => s.id === setId) ?? null);
	const matrixData = $derived(set?.matrices.find((m) => m.id === matrixId) ?? null);

	const parsedSeries = $derived(
		set
			? (() => {
					const r = parseSeries(set.seriesInput, set.pitchClassOfC);
					return isParseError(r) ? null : r;
				})()
			: null
	);

	const matrix = $derived(
		parsedSeries && matrixData
			? buildMatrix(parsedSeries, {
					transform: matrixData.transform,
					stravinskyVerticals: matrixData.stravinskyVerticals
				})
			: null
	);

	const alteredSeries = $derived(
		parsedSeries && matrixData ? applyMatrixTransform(matrixData.transform, parsedSeries) : null
	);

	function displaySeries(s: number[]): string {
		if (matrixData?.displayType === 'noteNames') {
			return s
				.map((p) =>
					pitchName(p, {
						pitchClassOfC: set?.pitchClassOfC ?? 0,
						accidentals: matrixData?.accidentals ?? 'sharps'
					})
				)
				.join('  ');
		}
		return s.join('  ');
	}

	let activeTab = $state<'matrix' | 'analysis'>('matrix');

	// Record view on navigation to this matrix
	$effect(() => {
		const sId = setId;
		const mId = matrixId;
		if (sId && mId) recordMatrixView(sId, mId);
	});

	// Bound display options — update matrixData in place
	function setDisplayType(v: 'numbers' | 'noteNames') {
		if (!set || !matrixData) return;
		updateMatrix(set.id, matrixData.id, { displayType: v });
	}

	function setAccidentals(v: 'sharps' | 'flats') {
		if (!set || !matrixData) return;
		updateMatrix(set.id, matrixData.id, { accidentals: v });
	}

	function setStravinsky(v: boolean) {
		if (!set || !matrixData) return;
		updateMatrix(set.id, matrixData.id, { stravinskyVerticals: v });
	}


</script>

{#if !set || !matrixData}
	<p>Not found. <a href="{base}/">Go home</a></p>
{:else}
	<div class="breadcrumb no-print">
		<a href="{base}/">Sets</a> / <span>{set.title}</span> / <span>{matrixData.name}</span>
	</div>

	<div class="page-header no-print">
		<div class="header-titles">
			<h1>{matrixData.name}</h1>
		</div>

		{#if parsedSeries}
			<div class="series-info">
				<div class="series-row">
					<span class="series-label">Original</span>
					<span class="series-values">{displaySeries(parsedSeries)}</span>
				</div>
				{#if alteredSeries}
					<div class="series-row">
						<span class="series-label">Altered</span>
						<span class="series-values">{displaySeries(alteredSeries)}</span>
					</div>
				{/if}
				<div class="series-row">
					<span class="series-label">Transform</span>
					<span class="series-values transform-concise"
						>{matrixTransformConciseLabel(matrixData.transform)}</span
					>
				</div>
			</div>
		{/if}
	</div>

	<!-- Tabs -->
	<div class="tabs no-print">
		<button class="tab" class:active={activeTab === 'matrix'} onclick={() => (activeTab = 'matrix')}
			>Matrix</button
		>
		<button
			class="tab"
			class:active={activeTab === 'analysis'}
			onclick={() => (activeTab = 'analysis')}>Analysis</button
		>
	</div>

	{#if activeTab === 'matrix'}
		<!-- Toolbar -->
		<div class="toolbar no-print">
			<div class="toolbar-group">
				<span class="toolbar-label">Display</span>
				<label class:selected={matrixData.displayType === 'numbers'}>
					<input
						type="radio"
						name="display"
						value="numbers"
						checked={matrixData.displayType === 'numbers'}
						onchange={() => setDisplayType('numbers')}
					/>
					Numbers
				</label>
				<label class:selected={matrixData.displayType === 'noteNames'}>
					<input
						type="radio"
						name="display"
						value="noteNames"
						checked={matrixData.displayType === 'noteNames'}
						onchange={() => setDisplayType('noteNames')}
					/>
					Note names
				</label>
			</div>

			{#if matrixData.displayType === 'noteNames'}
				<div class="toolbar-group">
					<span class="toolbar-label">Accidentals</span>
					<label class:selected={matrixData.accidentals === 'sharps'}>
						<input
							type="radio"
							name="accidentals"
							value="sharps"
							checked={matrixData.accidentals === 'sharps'}
							onchange={() => setAccidentals('sharps')}
						/>
						Sharps
					</label>
					<label class:selected={matrixData.accidentals === 'flats'}>
						<input
							type="radio"
							name="accidentals"
							value="flats"
							checked={matrixData.accidentals === 'flats'}
							onchange={() => setAccidentals('flats')}
						/>
						Flats
					</label>
				</div>
			{/if}

			<div class="toolbar-group">
				<label class="checkbox-label">
					<input
						type="checkbox"
						checked={matrixData.stravinskyVerticals}
						onchange={(e) => setStravinsky((e.target as HTMLInputElement).checked)}
					/>
					Stravinsky verticals
				</label>
			</div>

			<button class="btn-print no-print" onclick={() => window.print()}>Print</button>
		</div>

		{#if matrix}
			<div class="matrix-section">
				<!-- Print header shown only when printing -->
				<div class="print-header print-only">
					<strong>{set.title}</strong> — {matrixData.name}
				</div>
				<MatrixGrid
					{matrix}
					displayType={matrixData.displayType}
					accidentals={matrixData.accidentals}
					pitchClassOfC={set.pitchClassOfC}
					intraHexachordal={matrixData.transform.intraHexachordal}
				/>
			</div>
		{:else}
			<p class="error">Could not build matrix — series may be invalid.</p>
		{/if}
	{:else if activeTab === 'analysis'}
		{#if parsedSeries}
			<AnalysisPanel series={parsedSeries} />
		{:else}
			<p class="error">Series is invalid or empty.</p>
		{/if}
	{/if}
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
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.header-titles {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	h1 {
		margin: 0;
		font-size: 1.3rem;
	}

	.series-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		align-items: flex-end;
	}

	.series-row {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.series-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #aaa;
		min-width: 4.5rem;
		text-align: right;
	}

	.series-values {
		font-family: monospace;
		font-size: 0.8rem;
		color: #444;
	}

	.transform-concise {
		font-family: inherit;
		color: #666;
	}

	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #e0e0e0;
		margin-bottom: 1rem;
	}

	.tab {
		padding: 0.5rem 1.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.9rem;
		color: #666;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
	}

	.tab.active {
		color: #1a73e8;
		border-bottom-color: #1a73e8;
		font-weight: 600;
	}

	.tab:hover:not(.active) {
		color: #333;
		background: #f5f5f5;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 0.6rem 0.75rem;
		background: #f8f8f8;
		border: 1px solid #e8e8e8;
		border-radius: 6px;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.toolbar-label {
		font-size: 0.8rem;
		color: #888;
		margin-right: 0.1rem;
	}

	.toolbar label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
	}

	.toolbar label.selected {
		background: #e8f0fe;
		color: #1a73e8;
	}

	.checkbox-label {
		font-size: 0.85rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.btn-print {
		margin-left: auto;
		padding: 0.3rem 0.8rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-print:hover {
		background: #f5f5f5;
	}

	.matrix-section {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		padding: 1.25rem;
		overflow-x: auto;
	}

	.print-header {
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		color: #333;
	}

	.error {
		color: #c00;
		font-size: 0.9rem;
	}

	/* Print styles */
	@media print {
		:global(.no-print) {
			display: none !important;
		}

		.print-only {
			display: block;
		}

		.matrix-section {
			border: none;
			padding: 0;
		}
	}

	@media not print {
		.print-only {
			display: none;
		}
	}
</style>
