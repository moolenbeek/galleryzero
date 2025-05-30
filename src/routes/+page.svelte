<script lang="ts">
    import Carousel from '$lib/components/home/carousel.svelte';
    import * as Card from "$lib/components/ui/card";
    import { Button } from '$lib/components/ui/button';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Gallery Zero - Home</title>
    <meta name="description" content="Welcome to Gallery Zero - A beautiful image gallery" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Hero Section with Carousel -->
    <section class="relative py-12 px-4">
        <div class="container mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-4">
                    Gallery Zero
                </h1>
                <p class="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Discover beautiful moments captured through our lens. Experience our latest gallery in this stunning auto-scrolling showcase.
                </p>
            </div>

            <!-- Carousel -->
            <div class="mb-16">
                <Carousel 
                    galleryItems={data?.galleryItems || []}
                    autoScrollInterval={5000}
                    showControls={true}
                    showIndicators={true}
                    className="shadow-2xl"
                />
            </div>

            <!-- Call to Action -->
            <div class="text-center">
                <div class="inline-flex flex-col sm:flex-row gap-4">
                    <Button 
                        href="/gallery" 
                        size="lg"
                        class="px-8 py-3 text-lg"
                    >
                        View Full Gallery
                    </Button>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div class="container mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Features
                </h2>
                <p class="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Experience our gallery with these amazing features
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card.Root class="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                    <Card.Content class="pt-6">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Auto-Scrolling Carousel
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300">
                            Enjoy a seamless viewing experience with our auto-scrolling image carousel that pauses on hover.
                        </p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                    <Card.Content class="pt-6">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Smart Search & Filter
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300">
                            Find exactly what you're looking for with our intelligent search and category filtering system.
                        </p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                    <Card.Content class="pt-6">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Lightning Fast
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300">
                            Built with modern web technologies for optimal performance and smooth user experience.
                        </p>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    {#if data?.galleryItems && data.galleryItems.length > 0}
        <section class="py-16 px-4">
            <div class="container mx-auto text-center">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                    <div>
                        <div class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {data.galleryItems.length}+
                        </div>
                        <div class="text-slate-600 dark:text-slate-300">
                            Beautiful Images
                        </div>
                    </div>
                    <div>
                        <div class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {new Set(data.galleryItems.map(item => item.categoryId).filter(Boolean)).size}+
                        </div>
                        <div class="text-slate-600 dark:text-slate-300">
                            Categories
                        </div>
                    </div>
                </div>
            </div>
        </section>
    {/if}
</div>
