<script lang="ts">
	import '../app.css';
	import Navigation from "$lib/components/navigation/navigation.svelte";
	let { children } = $props();
</script>

<Navigation />

{@render children()}
