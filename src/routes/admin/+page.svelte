<script lang="ts">
	import Dashboard from '$lib/components/admin/dashboard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="p-4">
	<Dashboard {...data} />
</div>
