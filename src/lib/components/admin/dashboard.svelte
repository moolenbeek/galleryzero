<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';
    import { Input } from "$lib/components/ui/input";
    import { Trash2, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Label } from "$lib/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";
    import { CldUploadWidget } from 'svelte-cloudinary';

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

    interface Props {
        user: { id: string; username: string; role: string };
        galleryItems: GalleryItem[];
        categories: Category[];
    }

    // Initialize props and state
    const props = $props();
    
    // State management
    let galleryItemsState = $state<GalleryItem[]>([]);
    let categoriesState = $state<Category[]>([]);
    let searchTerm = $state('');
    let selectedCategoryId = $state<number | null>(null);
    let sortOrder = $state<'newest' | 'oldest'>('newest');
    let itemToDelete = $state<number | null>(null);
    let categoryToDelete = $state<number | null>(null);
    
    // Pagination state
    let currentPage = $state(0);
    let itemsPerPage = 10;
    
    // Dialog states
    let showAddDialog = $state(false);
    let showAddCategoryDialog = $state(false);
    
    // Hover preview state
    let hoveredImage = $state<string | null>(null);
    let mousePosition = $state({ x: 0, y: 0 });
    
    // Form states
    let newItem = $state({
        description: '',
        categoryId: '',
        imageUrl: ''
    });
    
    let newCategory = $state({
        name: '',
        slug: ''
    });

    // Initialize state from props
    $effect(() => {
        if (props.galleryItems) {
            galleryItemsState = [...props.galleryItems];
        }
        if (props.categories) {
            categoriesState = [...props.categories];
        }
    });

    // Computed values
    let filteredItems = $derived(
        galleryItemsState
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

    // Pagination computed values
    let totalPages = $derived(Math.ceil(filteredItems.length / itemsPerPage));
    let paginatedItems = $derived(
        filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    );

    // Pagination functions
    function goToPreviousPage() {
        if (currentPage > 0) {
            currentPage--;
        }
    }

    function goToNextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
        }
    }

    // Reset to first page when search term changes
    $effect(() => {
        currentPage = 0;
    });

    // Dialog handlers
    function closeDialog() {
        showAddDialog = false;
        newItem = { description: '', categoryId: '', imageUrl: '' };
    }

    function closeCategoryDialog() {
        console.log('closeCategoryDialog called, current showAddCategoryDialog:', showAddCategoryDialog);
        showAddCategoryDialog = false;
        newCategory = { name: '', slug: '' };
        console.log('closeCategoryDialog finished, showAddCategoryDialog should now be:', showAddCategoryDialog);
    }

    // Category handlers
    function handleCategorySelect(value: any) {
        if (value?.value?.id) {
            newItem.categoryId = value.value.id.toString();
        } else {
            newItem.categoryId = '';
        }
    }

    // Filter handlers
    function handleCategoryFilter(value: any) {
        if (value?.value?.id) {
            selectedCategoryId = value.value.id;
        } else {
            selectedCategoryId = null;
        }
    }

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

    // Hover preview handlers
    function handleImageHover(imageUrl: string, event: MouseEvent) {
        hoveredImage = imageUrl;
        updateMousePosition(event);
    }

    function handleImageLeave() {
        hoveredImage = null;
    }

    function updateMousePosition(event: MouseEvent) {
        mousePosition = { x: event.clientX, y: event.clientY };
    }

    async function handleDeleteCategory() {
        if (!categoryToDelete) return;
        
        const formData = new FormData();
        formData.append('id', categoryToDelete.toString());
        
        const response = await fetch('?/deleteCategory', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Create a new array with the filtered state
            const updatedCategories = categoriesState.filter(category => category.id !== categoryToDelete);
            // Update the state with the new array
            categoriesState = updatedCategories;
        }
        
        categoryToDelete = null;
    }

    async function handleDelete() {
        if (!itemToDelete) return;
        
        const formData = new FormData();
        formData.append('id', itemToDelete.toString());
        
        const response = await fetch('?/deleteItem', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Create a new array with the filtered state
            const updatedItems = galleryItemsState.filter(item => item.id !== itemToDelete);
            // Update the state with the new array
            galleryItemsState = updatedItems;
        }
        
        itemToDelete = null;
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>User</Card.Title>
    </Card.Header>
    <Card.Content>
        <p>Hi {props.user?.username || 'Guest'}</p>
        <form method="post" action="?/logout" use:enhance>
            <div class="flex gap-2 pt-4">
                <Button type="submit">Log out</Button>  
            </div>
        </form>
    </Card.Content>
</Card.Root>

<Card.Root class="mt-4">
    <Card.Header>
        <Card.Title>Categories</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="rounded-md border">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Name</Table.Head>
                        <Table.Head class="w-[100px]">Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each categoriesState as category}
                        <Table.Row>
                            <Table.Cell>{category.name}</Table.Cell>
                            <Table.Cell>
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger asChild let:builder>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            builders={[builder]}
                                            on:click={() => categoryToDelete = category.id}
                                        >
                                            <Trash2 class="h-4 w-4" />
                                        </Button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content>
                                        <AlertDialog.Header>
                                            <AlertDialog.Title>Are you sure?</AlertDialog.Title>
                                            <AlertDialog.Description>
                                                This action cannot be undone. This will permanently delete the category and all associated gallery items.
                                            </AlertDialog.Description>
                                        </AlertDialog.Header>
                                        <AlertDialog.Footer>
                                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                            <AlertDialog.Action on:click={handleDeleteCategory}>
                                                Delete
                                            </AlertDialog.Action>
                                        </AlertDialog.Footer>
                                    </AlertDialog.Content>
                                </AlertDialog.Root>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    </Card.Content>
    <Card.Footer>
        <div class="flex justify-start w-full">
            <Dialog.Root bind:open={showAddCategoryDialog}>
                <Dialog.Trigger asChild let:builder>
                    <Button builders={[builder]}>Add Category</Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Add New Category</Dialog.Title>
                        <Dialog.Description>
                            Add a new category to your gallery.
                        </Dialog.Description>
                    </Dialog.Header>
                    <form class="grid gap-4 py-4" method="post" action="?/addCategory" use:enhance={() => {
                        return async ({ result, update }) => {
                            if (result.type === 'success') {
                                await update();
                                closeCategoryDialog();
                            }
                        };
                    }}>
                        <div class="grid gap-2">
                            <Label for="category-name">Name</Label>
                            <Input 
                                id="category-name"
                                name="name"
                                bind:value={newCategory.name}
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        <Dialog.Footer class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" on:click={closeCategoryDialog}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Category
                            </Button>
                        </Dialog.Footer>
                    </form>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    </Card.Footer>
</Card.Root>

<Card.Root class="mt-4">
    <Card.Header>
        <Card.Title>Gallery</Card.Title>
    </Card.Header>
    <Card.Content>
        <!-- Filters -->
        <div class="mb-6 space-y-4">
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
                        selected={selectedCategoryId ? { value: categoriesState.find((c: Category) => c.id === selectedCategoryId) } : { value: null }}
                        onSelectedChange={handleCategoryFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>All categories</SelectItem>
                            {#each categoriesState as category}
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
                Showing {filteredItems.length} of {galleryItemsState.length} images
            </div>
        </div>

        <div class="rounded-md border">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Image</Table.Head>
                        <Table.Head>Description</Table.Head>
                        <Table.Head>Category</Table.Head>
                        <Table.Head class="w-[100px]">Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each paginatedItems as item (item.id)}
                        <Table.Row>
                            <Table.Cell class="w-[80px]">
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.description || 'Gallery image'} 
                                    class="w-16 h-16 object-cover rounded-md border cursor-pointer"
                                    loading="lazy"
                                    onmouseenter={(event) => handleImageHover(item.imageUrl, event)}
                                    onmouseleave={handleImageLeave}
                                    onmousemove={updateMousePosition}
                                />
                            </Table.Cell>
                            <Table.Cell>{item.description}</Table.Cell>
                            <Table.Cell>{item.category?.name || 'No Category'}</Table.Cell>
                            <Table.Cell>
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger asChild let:builder>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            builders={[builder]}
                                            on:click={() => itemToDelete = item.id}
                                        >
                                            <Trash2 class="h-4 w-4" />
                                        </Button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content>
                                        <AlertDialog.Header>
                                            <AlertDialog.Title>Are you sure?</AlertDialog.Title>
                                            <AlertDialog.Description>
                                                This action cannot be undone. This will permanently delete the gallery item.
                                            </AlertDialog.Description>
                                        </AlertDialog.Header>
                                        <AlertDialog.Footer>
                                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                            <AlertDialog.Action on:click={handleDelete}>
                                                Delete
                                            </AlertDialog.Action>
                                        </AlertDialog.Footer>
                                    </AlertDialog.Content>
                                </AlertDialog.Root>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    </Card.Content>
    <Card.Footer>
        <div class="flex items-center justify-between w-full">
            <Dialog.Root bind:open={showAddDialog}>
                <Dialog.Trigger asChild let:builder>
                    <Button builders={[builder]}>Add Image</Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Add New Image</Dialog.Title>
                        <Dialog.Description>
                            Add a new image to your gallery.
                        </Dialog.Description>
                    </Dialog.Header>
                    <form class="grid gap-4 py-4" method="post" action="?/addItem" use:enhance={() => {
                        return async ({ result, update }) => {
                            if (result.type === 'success') {
                                await update();
                                closeDialog();
                            }
                        };
                    }}>
                        <div class="grid gap-2">
                            <Label for="gallery-description">Description</Label>
                            <Input 
                                id="gallery-description"
                                name="description"
                                bind:value={newItem.description}
                                placeholder="Enter image description"
                                required
                            />
                        </div>
                        <div class="grid gap-2">
                            <Label for="gallery-category-select">Category</Label>
                            <div 
                                id="gallery-category-select" 
                                role="combobox" 
                                aria-label="Select a category" 
                                aria-controls="category-list" 
                                aria-expanded={showAddDialog}
                            >
                                <Select 
                                    name="category"
                                    selected={newItem.categoryId ? { value: categoriesState.find((c: Category) => c.id === parseInt(newItem.categoryId)) } : undefined} 
                                    onSelectedChange={handleCategorySelect}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent id="category-list">
                                        {#each categoriesState as category}
                                            <SelectItem value={category}>
                                                {category.name}
                                            </SelectItem>
                                        {/each}
                                    </SelectContent>
                                </Select>
                            </div>
                            <!-- Hidden input for form submission -->
                            <input type="hidden" name="categoryId" bind:value={newItem.categoryId} />
                        </div>
                        <div class="grid gap-2">
                            <Label for="gallery-image-url">Image</Label>
                            <CldUploadWidget
                                uploadPreset={import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}
                                onUpload={(result, widget) => {
                                    if (result.event === "success" && result.info && typeof result.info !== 'string') {
                                        newItem.imageUrl = result.info.secure_url;
                                        widget.close();
                                    }
                                }}
                                let:open
                            >
                                <Button type="button" on:click={() => open()} variant="outline" class="w-full">
                                    {newItem.imageUrl ? 'Change Image' : 'Upload Image'}
                                </Button>
                            </CldUploadWidget>
                            {#if newItem.imageUrl}
                                <div class="mt-2">
                                    <img src={newItem.imageUrl} alt="Preview" class="w-full h-32 object-cover rounded-md border" />
                                    <p class="text-sm text-muted-foreground mt-1 break-all">{newItem.imageUrl}</p>
                                </div>
                            {/if}
                            <!-- Hidden input for form submission -->
                            <input type="hidden" name="imageUrl" bind:value={newItem.imageUrl} required />
                        </div>
                        <Dialog.Footer class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" on:click={closeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Image
                            </Button>
                        </Dialog.Footer>
                    </form>
                </Dialog.Content>
            </Dialog.Root>
            <div class="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    on:click={goToPreviousPage}
                    disabled={currentPage === 0}
                    class="flex items-center gap-1"
                >
                    <ChevronLeft class="h-4 w-4" />
                    <span class="hidden sm:inline">Previous</span>
                </Button>
                <span class="text-sm text-muted-foreground px-2 sm:px-3 whitespace-nowrap">
                    Page {currentPage + 1} of {totalPages || 1}
                </span>
                <Button 
                    variant="outline" 
                    size="sm"
                    on:click={goToNextPage}
                    disabled={currentPage >= totalPages - 1}
                    class="flex items-center gap-1"
                >
                    <span class="hidden sm:inline">Next</span>
                    <ChevronRight class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </Card.Footer>
</Card.Root> 

<!-- Hover Preview -->
{#if hoveredImage}
    <div 
        class="fixed pointer-events-none z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
        style="left: {mousePosition.x + 10}px; top: {mousePosition.y - 150}px;"
    >
        <img 
            src={hoveredImage} 
            alt="Preview" 
            class="w-64 h-48 object-cover rounded-md"
            loading="lazy"
        />
    </div>
{/if} 