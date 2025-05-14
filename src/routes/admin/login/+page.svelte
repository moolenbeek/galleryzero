<script lang="ts">
	import Login from '$lib/components/admin/login.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<Login {form} />
