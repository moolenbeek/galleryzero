<script lang="ts">
	import '../app.css';
	import Navigation from "$lib/components/navigation/navigation.svelte";
	let { children } = $props();
</script>

<Navigation />
<div class="p-4">
	{@render children()}
</div>
