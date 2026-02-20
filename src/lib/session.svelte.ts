/**
 * In-memory session state — not persisted to localStorage.
 * Survives SvelteKit client-side navigation but resets on full page reload.
 */
export const session = $state({
	expandedSetId: null as string | null
});
