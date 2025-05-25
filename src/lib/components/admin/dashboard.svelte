<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';
    import { Input } from "$lib/components/ui/input";
    import { Trash2 } from 'lucide-svelte';
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Label } from "$lib/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "$lib/components/ui/select";

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
    let itemToDelete = $state<number | null>(null);
    let categoryToDelete = $state<number | null>(null);
    
    // Dialog states
    let showAddDialog = $state(false);
    let showAddCategoryDialog = $state(false);
    
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
        galleryItemsState.filter((item: GalleryItem) => 
            (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
    );

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
                        <Table.Head>Slug</Table.Head>
                        <Table.Head class="w-[100px]">Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each categoriesState as category}
                        <Table.Row>
                            <Table.Cell>{category.name}</Table.Cell>
                            <Table.Cell>{category.slug}</Table.Cell>
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
                    <Dialog.Footer>
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
    </Card.Footer>
</Card.Root>

<Card.Root class="mt-4">
    <Card.Header>
        <Card.Title>Gallery</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex items-center py-4">
            <Input
                class="max-w-sm"
                placeholder="Filter items..."
                type="text"
                bind:value={searchTerm}
            />
        </div>
        <div class="rounded-md border">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Description</Table.Head>
                        <Table.Head>Category</Table.Head>
                        <Table.Head class="w-[100px]">Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each filteredItems as item (item.id)}
                        <Table.Row>
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
                        <Label for="gallery-image-url">Image URL</Label>
                        <Input 
                            id="gallery-image-url"
                            name="imageUrl"
                            bind:value={newItem.imageUrl}
                            placeholder="Enter image URL"
                            required
                        />
                    </div>
                    <Dialog.Footer>
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
    </Card.Footer>
</Card.Root> 