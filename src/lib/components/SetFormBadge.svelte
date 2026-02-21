<script lang="ts">
	import { setFormLabel, applySetForm } from '$lib/music/setForm.js';
	import type { SetForm } from '$lib/music/setForm.js';
	import type { Series } from '$lib/music/series.js';

	interface Props {
		form: SetForm;
		series: Series;
	}

	let { form, series }: Props = $props();

	let showDetails = $state(false);
	let badgeRef: HTMLElement | null = $state(null);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let revealedBy: 'hover' | 'click' | null = $state(null);

	const pitches = $derived(applySetForm(form, series));

	$effect(() => {
		// Cleanup: clear timeout when component unmounts
		return () => {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
			}
		};
	});

	function handleClick() {
		// Clear hover timeout when user clicks
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
		showDetails = !showDetails;
		if (showDetails) {
			revealedBy = 'click';
		} else {
			revealedBy = null;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			showDetails = !showDetails;
		} else if (e.key === 'Escape') {
			showDetails = false;
			(e.target as HTMLButtonElement).blur();
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (badgeRef && !badgeRef.contains(e.target as Node)) {
			showDetails = false;
		}
	}

	function handleMouseEnter() {
		hoverTimeout = setTimeout(() => {
			showDetails = true;
			revealedBy = 'hover';
		}, 1000);
	}

	function handleMouseLeave() {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
		// Hide details if they were revealed by hover
		if (revealedBy === 'hover') {
			showDetails = false;
			revealedBy = null;
		}
	}
</script>

<svelte:document onmousedown={handleClickOutside} />

<div class="form-badge-wrapper" bind:this={badgeRef}>
	<button
		class="badge form"
		class:active={showDetails}
		onclick={handleClick}
		onkeydown={handleKeydown}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		type="button"
		aria-label="Show pitch classes for {setFormLabel(form)}"
	>
		{setFormLabel(form)}
	</button>

	{#if showDetails}
		<div class="details-popup">
			<div class="details-header">{setFormLabel(form)}</div>
			<div class="details-pitches">
				{#each pitches as pitch, i}
					<span class="pitch-item">
						{pitch}
						{#if i < pitches.length - 1}
							<span class="pitch-sep">·</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.form-badge-wrapper {
		position: relative;
		display: inline-block;
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		font-size: 0.8rem;
		font-weight: 600;
		background: #f3e5f5;
		color: #6a1b9a;
		border: 1px solid #ce93d8;
		font-family: monospace;
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
		font: inherit;
	}

	.badge:hover {
		background: #f1e0f3;
		border-color: #ba68c8;
	}

	.badge.active {
		background: #f0d9f0;
		border-color: #ba68c8;
	}

	.details-popup {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.4rem;
		background: white;
		border: 1px solid #ce93d8;
		border-radius: 4px;
		padding: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		white-space: nowrap;
		font-size: 0.8rem;
	}

	.details-header {
		font-weight: 600;
		color: #6a1b9a;
		margin-bottom: 0.25rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid #f0d9f0;
	}

	.details-pitches {
		display: flex;
		gap: 0;
		font-family: monospace;
		color: #333;
	}

	.pitch-item {
		display: inline;
	}

	.pitch-sep {
		color: #ccc;
		font-size: 0.65rem;
		margin: 0 0.15rem;
	}
</style>
