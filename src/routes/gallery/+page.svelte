<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from '$lib/components/ui/button';
    import { Input } from "$lib/components/ui/input";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

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

    interface Category {
        id: number;
        name: string;
        slug: string;
    }

    let { data }: { data: PageData } = $props();
    
    // State management
    let searchTerm = $state('');
    let selectedCategoryId = $state<number | null>(null);
    let sortOrder = $state<'newest' | 'oldest'>('newest');
    let isLoading = $state(true);
    
    // Ensure data is available before filtering
    let galleryItems = $derived(data?.galleryItems || []);
    let categories = $derived(data?.categories || []);
    
    // Computed values for filtering and sorting
    let filteredItems = $derived(
        galleryItems
            .filter((item: GalleryItem) => {
                const matchesSearch = (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                    (item.category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                
                const matchesCategory = selectedCategoryId === null || item.categoryId === selectedCategoryId;
                
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortOrder === 'newest') {
                    return b.id - a.id; // Assuming higher ID means newer
                } else {
                    return a.id - b.id; // Lower ID means older
                }
            })
    );

    // Category filter handler
    function handleCategoryFilter(value: any) {
        if (value?.value?.id) {
            selectedCategoryId = value.value.id;
        } else {
            selectedCategoryId = null;
        }
    }

    // Sort filter handler
    function handleSortFilter(value: any) {
        if (value?.value) {
            sortOrder = value.value;
        }
    }

    function clearFilters() {
        searchTerm = '';
        selectedCategoryId = null;
        sortOrder = 'newest';
    }

    onMount(() => {
        // Simple delay for hydration
        setTimeout(() => {
            isLoading = false;
        }, 200);
    });
</script>

<svelte:head>
    <title>Gallery</title>
    <meta name="description" content="Browse our image gallery" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-center mb-2">Gallery</h1>
    </div>

    <!-- Filters -->
    <div class="mb-8 space-y-4 pt-4">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div class="w-full flex-1 max-w-lg">
                <Input
                    placeholder="Search images..."
                    type="text"
                    bind:value={searchTerm}
                />
            </div>
            
            <div class="w-full flex-1 min-w-[200px]">
                <Select 
                    selected={selectedCategoryId ? { value: categories.find((c: Category) => c.id === selectedCategoryId) } : { value: null }}
                    onSelectedChange={handleCategoryFilter}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={null}>All categories</SelectItem>
                        {#each categories as category}
                            <SelectItem value={category}>
                                {category.name}
                            </SelectItem>
                        {/each}
                    </SelectContent>
                </Select>
            </div>

            <div class="w-full flex-1 min-w-[200px]">
                <Select 
                    selected={{ value: sortOrder }}
                    onSelectedChange={handleSortFilter}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {#if searchTerm || selectedCategoryId || sortOrder !== 'newest'}
                <Button variant="outline" on:click={clearFilters} class="w-full sm:w-auto">
                    Clear filters
                </Button>
            {/if}
        </div>
        
        <div class="text-sm text-muted-foreground">
            Showing {filteredItems.length} of {galleryItems.length} images
        </div>
    </div>

    <!-- Gallery Grid -->
    {#if isLoading}
        <div class="text-center py-12">
            <div class="text-muted-foreground">Loading gallery...</div>
        </div>
    {:else if filteredItems.length > 0}
        <div class="gallery-grid">
            {#each filteredItems as item (item.id)}
                <Card.Root class="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                    <div class="gallery-image-container">
                        <img 
                            src={item.imageUrl} 
                            alt={item.description}
                            class="gallery-image"
                            loading="lazy"
                        />
                    </div>
                    <Card.Content class="p-4 text-center">
                        <h3 class="font-medium text-sm mb-2 line-clamp-2">{item.description}</h3>
                        {#if item.category}
                            <div class="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                                {item.category.name}
                            </div>
                        {/if}
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {:else}
        <div class="text-center py-12">
            <div class="text-muted-foreground mb-4">
                {#if searchTerm || selectedCategoryId}
                    No images found matching your filters.
                {:else}
                    No images available in the gallery yet.
                {/if}
            </div>
            {#if searchTerm || selectedCategoryId}
                <Button variant="outline" on:click={clearFilters}>
                    Clear filters
                </Button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .gallery-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    @media (min-width: 640px) {
        .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (min-width: 768px) {
        .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    @media (min-width: 1024px) {
        .gallery-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }
    
    @media (min-width: 1280px) {
        .gallery-grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }
    
    @media (min-width: 1536px) {
        .gallery-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }
    
    .gallery-image-container {
        aspect-ratio: 1 / 1;
        overflow: hidden;
        width: 100%;
    }
    
    .gallery-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease-in-out;
    }
    
    .gallery-image:hover {
        transform: scale(1.05);
    }
</style>