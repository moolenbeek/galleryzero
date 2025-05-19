<script lang="ts">
	import Dashboard from '$lib/components/admin/dashboard.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<Dashboard {data}/>
