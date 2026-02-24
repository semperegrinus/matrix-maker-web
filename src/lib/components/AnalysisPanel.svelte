<script lang="ts">
	import { analyzeSeries } from '$lib/music/analysis.js';
	import { computeIntervalVector } from '$lib/music/intervalVector.js';
	import { chordPitches } from '$lib/music/chord.js';
	import { setFormLabel } from '$lib/music/setForm.js';
	import type { Series } from '$lib/music/series.js';
	import type { CombinatorialAnalysis } from '$lib/music/analysis.js';
	import { ENABLE_DYADIC_ANALYSIS } from '$lib/featureFlags.js';
	import SetFormBadge from './SetFormBadge.svelte';

	interface Props {
		series: Series;
	}

	let { series }: Props = $props();

	const analysis = $derived(analyzeSeries(series));

	function ivString(iv: number[]): string {
		return '<' + iv.join('') + '>';
	}

	const CLASS_COLORS = ['#e3f2fd', '#e8f5e9', '#fff8e1', '#fce4ec', '#f3e5f5'];
</script>

<div class="analysis">
	<!-- Set properties -->
	<section>
		<h3>Set Properties</h3>

		{#if analysis.allInterval}
			<div class="badge all-interval">All-interval series</div>
		{:else}
			<div class="subsection">
				<span class="sub-label">Adjacency intervals</span>
				<div class="interval-row">
					{#each analysis.adjacencyIntervals as count, i}
						<span class="iv-cell" class:nonzero={count > 0}>
							<span class="iv-label">{i + 1}</span>
							<span class="iv-count">{count}</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if analysis.degenerateForm}
			<div class="degenerate-badge-wrapper">
				<span class="degenerate-label">Degenerate:</span>
			<SetFormBadge form={analysis.degenerateForm} {series} />
			</div>
		{/if}
	</section>

	<!-- Hexachordal -->
	{#if analysis.hexachordal}
		{@const hex = analysis.hexachordal}
		<section>
			<h3>Hexachordal</h3>

			{#if hex.info}
				<div class="subsection">
					<span class="sub-label">Hexachord</span>
					<span class="value">#{hex.info.number} — {hex.info.combinatoriality}</span>
				</div>

				{#if hex.info.properties.length > 0}
					<div class="subsection">
						<span class="sub-label">Properties</span>
						{#each hex.info.properties as prop}
							<span class="badge prop">{prop}</span>
						{/each}
					</div>
				{/if}
			{/if}

			{#if hex.combinatorialForms.length > 0}
				<div class="subsection">
					<span class="sub-label">Combinatorial forms</span>
					<div class="badge-row">
						{#each hex.combinatorialForms as form}
							<SetFormBadge {form} {series} />
						{/each}
					</div>
				</div>
			{/if}

			<div class="subsection">
				<span class="sub-label">Interval vectors</span>
				{#each hex.chords as chord, i}
					<div class="iv-entry">
						<span class="iv-label-sm">H{i + 1}</span>
						<span class="iv-vector">{ivString(computeIntervalVector(chordPitches(chord)))}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Tetrachordal and Trichordal analyses - always shown -->
	{#each (['tetrachordal', 'trichordal'] as const) as key}
		{@const ca = analysis[key] as CombinatorialAnalysis | null}
		{#if ca}
			<section>
				<h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>

				<div class="subsection">
					<span class="sub-label">Segments</span>
					<div>
						{#each ca.chords as chord, i}
							<div class="iv-entry">
								<span class="iv-label-sm">{i + 1}</span>
								<span class="chord-pitches">{series.slice(i * ca.chordSize, (i + 1) * ca.chordSize).join(' ')}</span>
								<span class="iv-vector">{ivString(computeIntervalVector(chordPitches(chord)))}</span>
							</div>
						{/each}
					</div>
				</div>

				{#if ca.combinatorialityClasses.length > 0}
					<div class="subsection">
						<span class="sub-label">Combinatoriality</span>
						<div class="comb-classes">
							{#each ca.combinatorialityClasses as cls, ci}
								<div
									class="comb-class"
									style:background={CLASS_COLORS[ci % CLASS_COLORS.length]}
								>
									{#each cls as group, gi}
										{#if gi > 0}<span class="sep">·</span>{/if}
										<div class="badge-row inline">
											{#each group as form}
												<SetFormBadge {form} {series} />
											{/each}
										</div>
									{/each}
								</div>
							{/each}
						</div>
					</div>

					{#if ca.generator}
						<div class="subsection">
							<span class="sub-label">Generator</span>
							<span class="value mono">{ca.generator.series.join(' ')}</span>
						</div>
					{/if}
				{/if}
			</section>
		{/if}
	{/each}

	<!-- Dyadic - only when feature flag is enabled and combinatoriality exists -->
	{#if ENABLE_DYADIC_ANALYSIS && analysis.dyadic && analysis.dyadic.combinatorialityClasses.length > 0}
		<section>
			<h3>Dyadic</h3>

			<div class="subsection">
				<span class="sub-label">Combinatoriality classes</span>
				<div class="comb-classes">
					{#each analysis.dyadic.combinatorialityClasses as cls, ci}
						<div
							class="comb-class"
							style:background={CLASS_COLORS[ci % CLASS_COLORS.length]}
						>
							{#each cls as group, gi}
								{#if gi > 0}<span class="sep">·</span>{/if}
								<div class="badge-row inline">
									{#each group as form}
										<SetFormBadge {form} {series} />
									{/each}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			{#if analysis.dyadic.generator}
				<div class="subsection">
					<span class="sub-label">Generator</span>
					<span class="value mono">{analysis.dyadic.generator.series.join(' ')}</span>
				</div>
			{/if}
		</section>
	{/if}

</div>

<style>
	.analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 640px;
	}

	section {
		border: 1px solid #e8e8e8;
		border-radius: 6px;
		padding: 1rem;
	}

	h3 {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		color: #333;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.8rem;
	}

	.subsection {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
		flex-wrap: wrap;
	}

	.sub-label {
		font-size: 0.8rem;
		color: #666;
		min-width: 120px;
		flex-shrink: 0;
		padding-top: 0.15rem;
	}

	.value {
		font-size: 0.9rem;
	}

	.value.mono {
		font-family: monospace;
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.badge.all-interval {
		background: #e8f5e9;
		color: #2e7d32;
		border: 1px solid #a5d6a7;
	}

	.degenerate-badge-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.5rem;
		background: #fff3e0;
		border: 1px solid #ffcc80;
		border-radius: 3px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.degenerate-label {
		color: #e65100;
	}

	.badge.prop {
		background: #e3f2fd;
		color: #1565c0;
		border: 1px solid #90caf9;
	}

	.badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.badge-row.inline {
		display: inline-flex;
	}

	.interval-row {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.iv-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1.8rem;
		padding: 0.2rem;
		border: 1px solid #e0e0e0;
		border-radius: 3px;
		font-size: 0.75rem;
	}

	.iv-cell.nonzero {
		background: #f3e5f5;
		border-color: #ce93d8;
	}

	.iv-label {
		color: #888;
		font-size: 0.65rem;
	}

	.iv-count {
		font-weight: 600;
		color: #333;
	}

	.iv-entry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.iv-label-sm {
		font-size: 0.8rem;
		color: #888;
		min-width: 2rem;
	}

	.iv-vector {
		font-family: monospace;
		font-size: 0.9rem;
		color: #333;
	}

	.chord-pitches {
		font-size: 0.85rem;
		color: #555;
		font-family: monospace;
		flex: 1;
	}

	.comb-classes {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.4rem;
	}

	.comb-class {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.6rem;
		border-radius: 5px;
		flex-wrap: wrap;
	}

	.sep {
		color: #999;
		margin: 0 0.1rem;
	}
</style>
