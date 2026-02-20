<script lang="ts">
	import { parseSeries, isParseError } from '$lib/music/series.js';
	import { pitchName } from '$lib/music/pitch.js';
	import type { SetData } from '$lib/types.js';

	interface Props {
		set?: SetData | null;
		duplicatingSet?: SetData | null;
		onconfirm: (data: { title: string; seriesInput: string; pitchClassOfC: number }) => void;
		oncancel: () => void;
	}

	let { set = null, duplicatingSet = null, onconfirm, oncancel }: Props = $props();

	const sourceSet = $derived(set ?? duplicatingSet);
	// svelte-ignore state_referenced_locally
	let title = $state(sourceSet?.title ?? '');
	// svelte-ignore state_referenced_locally
	let seriesInput = $state(sourceSet?.seriesInput ?? '');
	// svelte-ignore state_referenced_locally
	let pitchClassOfC = $state(sourceSet?.pitchClassOfC ?? 0);

	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog?.showModal();
	});

	const parseResult = $derived(parseSeries(seriesInput, pitchClassOfC));
	const parseError = $derived(isParseError(parseResult) ? parseResult : null);
	const isValid = $derived(title.trim().length > 0 && !parseError && (parseResult as number[]).length > 0);

	const NOTE_NAMES_BY_PC = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

	function handleConfirm() {
		if (!isValid) return;
		onconfirm({ title: title.trim(), seriesInput, pitchClassOfC });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') oncancel();
	}

	function parseErrorMessage(err: NonNullable<typeof parseError>): string {
		if (err.kind === 'invalidToken') return `Invalid token: "${err.token}"`;
		return `Repeated pitch: "${err.first}" and "${err.second}"`;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onkeydown={handleKeydown} onclose={oncancel}>
	<form method="dialog" onsubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
		<h2>{set ? 'Edit Set' : duplicatingSet ? 'Duplicate Set' : 'New Set'}</h2>

		<div class="field">
			<label for="set-title">Title</label>
			<input
				id="set-title"
				type="text"
				bind:value={title}
				placeholder="e.g. Webern Op. 24"
				autocomplete="off"
			/>
		</div>

		<div class="field">
			<label for="set-series">Series</label>
			<input
				id="set-series"
				type="text"
				bind:value={seriesInput}
				placeholder="e.g. 0 11 3 4 8 7 9 5 6 1 2 10"
				autocomplete="off"
				class:error={parseError !== null && seriesInput.length > 0}
			/>
			{#if parseError && seriesInput.length > 0}
				<span class="error-msg">{parseErrorMessage(parseError)}</span>
			{:else if !isParseError(parseResult) && parseResult.length > 0}
				<span class="hint">{parseResult.length} pitches</span>
			{/if}
		</div>

		<div class="field">
			<label for="set-pcc">C =</label>
			<select id="set-pcc" bind:value={pitchClassOfC}>
				{#each Array.from({ length: 12 }, (_, i) => i) as pc}
					<option value={pc}>{pc}</option>
				{/each}
			</select>
		</div>

		<div class="actions">
			<button type="button" onclick={oncancel}>Cancel</button>
			<button type="submit" disabled={!isValid}>{set ? 'Save' : 'Create'}</button>
		</div>
	</form>
</dialog>

<style>
	dialog {
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 1.5rem;
		min-width: 340px;
		max-width: 480px;
		background: white;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1.1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #555;
	}

	input,
	select {
		padding: 0.4rem 0.6rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.95rem;
		font-family: inherit;
	}

	input.error {
		border-color: #c00;
	}

	.error-msg {
		font-size: 0.8rem;
		color: #c00;
	}

	.hint {
		font-size: 0.8rem;
		color: #666;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	button {
		padding: 0.4rem 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		background: white;
	}

	button[type='submit'] {
		background: #1a73e8;
		color: white;
		border-color: #1a73e8;
	}

	button[type='submit']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button[type='button']:hover:not(:disabled) {
		background: #f5f5f5;
	}

	button[type='submit']:hover:not(:disabled) {
		background: #1558b0;
	}
</style>
