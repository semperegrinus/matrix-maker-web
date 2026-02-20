<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	$effect(() => {
		goto(`${base}/`, { replaceState: true });
	});
</script>
