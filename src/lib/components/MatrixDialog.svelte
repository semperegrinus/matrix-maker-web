<script lang="ts">
	import {
		applyMatrixTransform,
		matrixTransformLabel,
		DEFAULT_MATRIX_TRANSFORM
	} from '$lib/music/matrixTransform.js';
	import type { MatrixTransform } from '$lib/music/matrixTransform.js';
	import { parseSeries, isParseError } from '$lib/music/series.js';
	import { buildMatrix } from '$lib/music/matrix.js';
	import { pitchName } from '$lib/music/pitch.js';
	import type { MatrixData } from '$lib/types.js';

	interface Props {
		matrix?: MatrixData | null;
		seriesInput: string;
		pitchClassOfC: number;
		onconfirm: (data: Omit<MatrixData, 'id'>) => void;
		oncancel: () => void;
	}

	let { matrix = null, seriesInput, pitchClassOfC, onconfirm, oncancel }: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		dialog?.showModal();
	});

	// Transform fields
	let invert = $state(matrix?.transform.invert ?? false);
	let multiplier = $state(matrix?.transform.multiplier ?? 1);
	let rotation = $state(matrix?.transform.rotation ?? 0);
	let intraHexachordal = $state(matrix?.transform.intraHexachordal ?? false);
	let shouldTranspose = $state(matrix?.transform.shouldTranspose ?? false);
	let firstPitchClass = $state(matrix?.transform.firstPitchClass ?? 0);
	let stravinskyVerticals = $state(matrix?.stravinskyVerticals ?? false);
	let displayType = $state<'numbers' | 'noteNames'>(matrix?.displayType ?? 'numbers');
	let accidentals = $state<'sharps' | 'flats'>(matrix?.accidentals ?? 'sharps');

	const transform = $derived<MatrixTransform>({
		invert,
		multiplier,
		rotation,
		intraHexachordal,
		shouldTranspose,
		firstPitchClass
	});

	const autoName = $derived(matrixTransformLabel(transform));
	let customName = $state(matrix?.name ?? '');
	// Keep name in sync with auto-label when it hasn't been manually edited
	let nameEdited = $state(matrix !== null);

	$effect(() => {
		if (!nameEdited) {
			customName = autoName;
		}
	});

	const parsedSeries = $derived(
		(() => {
			const r = parseSeries(seriesInput, pitchClassOfC);
			return isParseError(r) ? null : r;
		})()
	);

	const transformedSeries = $derived(
		parsedSeries ? applyMatrixTransform(transform, parsedSeries) : null
	);

	const previewMatrix = $derived(
		transformedSeries && parsedSeries
			? buildMatrix(parsedSeries, { transform, stravinskyVerticals })
			: null
	);

	const previewRow = $derived(previewMatrix ? previewMatrix.entries[0] : null);

	function displayPitch(p: number): string {
		if (displayType === 'noteNames') {
			return pitchName(p, { pitchClassOfC, accidentals });
		}
		return String(p);
	}

	function handleNameInput() {
		nameEdited = true;
	}

	function handleConfirm() {
		onconfirm({
			name: customName || autoName,
			transform,
			stravinskyVerticals,
			displayType,
			accidentals
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') oncancel();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onkeydown={handleKeydown} onclose={oncancel}>
	<form method="dialog" onsubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
		<h2>{matrix ? 'Edit Matrix' : 'New Matrix'}</h2>

		<div class="field">
			<label for="matrix-name">Name</label>
			<input
				id="matrix-name"
				type="text"
				bind:value={customName}
				oninput={handleNameInput}
				placeholder={autoName}
			/>
		</div>

		<fieldset>
			<legend>Transform</legend>

			<div class="field-row">
				<label>
					<input type="checkbox" bind:checked={invert} />
					Invert
				</label>
			</div>

			<div class="field-row">
				<label for="matrix-multiplier">Multiplier</label>
				<select id="matrix-multiplier" bind:value={multiplier}>
					<option value={1}>None (×1)</option>
					<option value={5}>M5 (×5)</option>
					<option value={7}>M7 (×7)</option>
					<option value={11}>M11 (×11)</option>
				</select>
			</div>

			<div class="field-row">
				<label for="matrix-rotation">Rotation</label>
				<select id="matrix-rotation" bind:value={rotation}>
					{#each Array.from({ length: 12 }, (_, i) => i) as r}
						<option value={r}>{r}</option>
					{/each}
				</select>
			</div>

			<div class="field-row">
				<label>
					<input type="checkbox" bind:checked={intraHexachordal} />
					Intra-hexachordal rotation
				</label>
			</div>

			<div class="field-row">
				<label>
					<input type="checkbox" bind:checked={shouldTranspose} />
					Transpose to begin on
				</label>
				{#if shouldTranspose}
					<select bind:value={firstPitchClass}>
						{#each Array.from({ length: 12 }, (_, i) => i) as p}
							<option value={p}>{p}</option>
						{/each}
					</select>
				{/if}
			</div>
		</fieldset>

		<fieldset>
			<legend>Display</legend>

			<div class="field-row">
				<label>
					<input type="checkbox" bind:checked={stravinskyVerticals} />
					Stravinsky verticals
				</label>
			</div>

			<div class="field-row">
				<span class="field-label">Show as</span>
				<label><input type="radio" bind:group={displayType} value="numbers" /> Numbers</label>
				<label><input type="radio" bind:group={displayType} value="noteNames" /> Note names</label>
			</div>

			<div class="field-row">
				<span class="field-label">Accidentals</span>
				<label><input type="radio" bind:group={accidentals} value="sharps" /> Sharps</label>
				<label><input type="radio" bind:group={accidentals} value="flats" /> Flats</label>
			</div>
		</fieldset>

		{#if parsedSeries}
			<div class="preview">
				<div class="preview-label">Preview (first row)</div>
				{#if transformedSeries}
					<div class="preview-series">
						{transformedSeries.map(displayPitch).join(' · ')}
					</div>
				{/if}
				{#if previewRow}
					<div class="preview-row">
						{previewRow.map(displayPitch).join(' · ')}
					</div>
				{/if}
			</div>
		{/if}

		<div class="actions">
			<button type="button" onclick={oncancel}>Cancel</button>
			<button type="submit">{matrix ? 'Save' : 'Create'}</button>
		</div>
	</form>
</dialog>

<style>
	dialog {
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 1.5rem;
		min-width: 360px;
		max-width: 520px;
		max-height: 90vh;
		overflow-y: auto;
		background: white;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1.1rem;
	}

	fieldset {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}

	legend {
		font-size: 0.85rem;
		font-weight: 600;
		color: #555;
		padding: 0 0.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.field-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	.field-label {
		font-size: 0.85rem;
		color: #555;
		min-width: 60px;
	}

	label {
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		cursor: pointer;
	}

	input[type='text'],
	select {
		padding: 0.4rem 0.6rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
		font-family: inherit;
	}

	.preview {
		background: #f8f8f8;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		padding: 0.75rem;
		margin-bottom: 1rem;
		font-family: monospace;
		font-size: 0.85rem;
	}

	.preview-label {
		font-size: 0.75rem;
		color: #888;
		margin-bottom: 0.35rem;
		font-family: inherit;
	}

	.preview-series {
		color: #555;
		margin-bottom: 0.35rem;
	}

	.preview-row {
		font-weight: 600;
		color: #222;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
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

	button[type='button']:hover {
		background: #f5f5f5;
	}

	button[type='submit']:hover {
		background: #1558b0;
	}
</style>
