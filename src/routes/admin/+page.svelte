<script lang="ts">
	import Dashboard from '$lib/components/admin/dashboard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Dashboard {...data} />
