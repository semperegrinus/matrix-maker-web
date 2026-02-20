<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { appState, saveState, exportState, importState } from '$lib/state.svelte.js';

	let { children } = $props();

	$effect(() => {
		if (browser) {
			// Track appState deeply for auto-save
			JSON.stringify(appState);
			saveState();
		}
	});

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			const text = await file.text();
			try {
				importState(text);
			} catch {
				alert('Failed to import: invalid JSON file.');
			}
		};
		input.click();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Matrix Maker</title>
</svelte:head>

<div class="app">
	<header class="app-header">
		<a href="/" class="app-title">Matrix Maker</a>
		<nav class="app-nav">
			<a href="/">Sets</a>
		</nav>
		<div class="header-actions">
			<button onclick={handleImport} class="btn-secondary">Import</button>
			<button onclick={exportState} class="btn-secondary">Export</button>
		</div>
	</header>

	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		color: #222;
		background: #fafafa;
	}

	:global(a) {
		color: #1a73e8;
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0 1.5rem;
		height: 52px;
		background: white;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.app-title {
		font-size: 1.05rem;
		font-weight: 700;
		color: #222;
		white-space: nowrap;
	}

	.app-nav {
		flex: 1;
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-secondary {
		padding: 0.3rem 0.8rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
		font-size: 0.85rem;
		cursor: pointer;
		color: #444;
	}

	.btn-secondary:hover {
		background: #f5f5f5;
	}

	.app-main {
		flex: 1;
		padding: 1.5rem;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
	}

	@media print {
		.app-header {
			display: none;
		}

		.app-main {
			padding: 0;
			max-width: none;
		}
	}
</style>
