<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from '$lib/components/ui/button';
    import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-svelte';
    import { onMount, onDestroy } from 'svelte';

    interface GalleryItem {
        id: number;
        description: string;
        imageUrl: string;
        categoryId: number | null;
        category: {
            id: number;
            name: string;
        } | null;
    }

    interface Props {
        galleryItems?: GalleryItem[];
        autoScrollInterval?: number;
        showControls?: boolean;
        showIndicators?: boolean;
        className?: string;
    }

    let { 
        galleryItems = [], 
        autoScrollInterval = 4000,
        showControls = true,
        showIndicators = true,
        className = ""
    }: Props = $props();

    // State management
    let currentIndex = $state(0);
    let isPlaying = $state(true);
    let intervalId: NodeJS.Timeout | null = null;
    let carouselContainer: HTMLElement;
    let isHovered = $state(false);

    // Computed values
    let totalItems = $derived(galleryItems.length);
    let currentItem = $derived(galleryItems[currentIndex]);

    // Auto-scroll functionality
    function startAutoScroll() {
        if (intervalId) clearInterval(intervalId);
        if (isPlaying && !isHovered && totalItems > 1) {
            intervalId = setInterval(() => {
                nextSlide();
            }, autoScrollInterval);
        }
    }

    function stopAutoScroll() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Navigation functions
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
    }

    function prevSlide() {
        currentIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    }

    function goToSlide(index: number) {
        currentIndex = index;
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    }

    // Mouse event handlers
    function handleMouseEnter() {
        isHovered = true;
        stopAutoScroll();
    }

    function handleMouseLeave() {
        isHovered = false;
        if (isPlaying) {
            startAutoScroll();
        }
    }

    // Lifecycle
    onMount(() => {
        startAutoScroll();
    });

    onDestroy(() => {
        stopAutoScroll();
    });

    // Reactive effects
    $effect(() => {
        if (isPlaying && !isHovered) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });

    // Keyboard navigation
    function handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextSlide();
                break;
            case ' ':
                event.preventDefault();
                togglePlayPause();
                break;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if totalItems > 0}
    <div 
        class="relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg shadow-2xl {className}"
        bind:this={carouselContainer}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        role="region"
        aria-label="Image carousel"
    >
        <!-- Main carousel container -->
        <div class="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {#if currentItem}
                <!-- Current image -->
                <div class="absolute inset-0 transition-opacity duration-700 ease-in-out">
                    <img 
                        src={currentItem.imageUrl} 
                        alt={currentItem.description}
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                    
                    <!-- Gradient overlay for better text readability -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <!-- Image description overlay -->
                    <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div class="max-w-2xl">
                            <h3 class="text-xl md:text-2xl font-semibold mb-2 drop-shadow-lg">
                                {currentItem.description}
                            </h3>
                            {#if currentItem.category}
                                <div class="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                                    {currentItem.category.name}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Navigation controls -->
        {#if showControls && totalItems > 1}
            <div class="absolute inset-y-0 left-0 flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    class="ml-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                    onclick={prevSlide}
                    aria-label="Previous image"
                >
                    <ChevronLeft class="h-6 w-6" />
                </Button>
            </div>
            
            <div class="absolute inset-y-0 right-0 flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    class="mr-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                    onclick={nextSlide}
                    aria-label="Next image"
                >
                    <ChevronRight class="h-6 w-6" />
                </Button>
            </div>
        {/if}

        <!-- Play/Pause control -->
        {#if showControls && totalItems > 1}
            <div class="absolute top-4 right-4">
                <Button
                    variant="ghost"
                    size="icon"
                    class="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                    onclick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                    {#if isPlaying}
                        <Pause class="h-4 w-4" />
                    {:else}
                        <Play class="h-4 w-4" />
                    {/if}
                </Button>
            </div>
        {/if}

        <!-- Indicators -->
        {#if showIndicators && totalItems > 1}
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div class="flex space-x-2">
                    {#each galleryItems as _, index}
                        <button
                            class="w-3 h-3 rounded-full transition-all duration-200 {
                                index === currentIndex 
                                    ? 'bg-white scale-110' 
                                    : 'bg-white/50 hover:bg-white/75'
                            }"
                            onclick={() => goToSlide(index)}
                            aria-label="Go to slide {index + 1}"
                        ></button>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Loading state for when no images -->
        {#if totalItems === 0}
            <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div class="text-center">
                    <div class="text-gray-500 dark:text-gray-400 mb-2">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">No images available</p>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    /* Smooth transitions for image changes */
    .carousel-image {
        transition: opacity 0.7s ease-in-out;
    }
    
    /* Focus styles for accessibility */
    .carousel-container:focus {
        outline: 2px solid hsl(var(--ring));
        outline-offset: 2px;
    }
    
    /* Custom scrollbar for webkit browsers */
    :global(.carousel-container::-webkit-scrollbar) {
        display: none;
    }
</style>
