<script lang="ts">
    import Gallery from '$lib/components/gallery/gallery.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Gallery</title>
    <meta name="description" content="Browse our image gallery" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-center mb-2">Gallery</h1>
    </div>

    <Gallery 
        galleryItems={data?.galleryItems || []} 
        categories={data?.categories || []} 
    />
</div>