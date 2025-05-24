<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';
    import { Input } from "$lib/components/ui/input";
    import { Trash2 } from 'lucide-svelte';
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    export let data: { 
        user: { id: string; username: string; role: string },
        galleryItems: Array<{
            id: string;
            name: string;
            description: string;
            category: {
                id: string;
                name: string;
            }
        }>
    };

    let searchTerm = '';
    let itemToDelete: string | null = null;
    
    $: filteredItems = data.galleryItems.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function handleDelete() {
        if (!itemToDelete) return;
        
        const formData = new FormData();
        formData.append('id', itemToDelete);
        
        const response = await fetch('?/deleteItem', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            data.galleryItems = data.galleryItems.filter(item => item.id !== itemToDelete);
        }
        
        itemToDelete = null;
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>User</Card.Title>
    </Card.Header>
    <Card.Content>
        <p>Hi {data.user.username}</p>
        <form method="post" action="?/logout" use:enhance>
            <div class="flex gap-2 pt-4">
                <Button type="submit">Log out</Button>  
            </div>
        </form>
    </Card.Content>
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
                    {#each filteredItems as item}
                        <Table.Row>
                            <Table.Cell>{item.description}</Table.Cell>
                            <Table.Cell>{item.category.name}</Table.Cell>
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
        <Button>Add Image</Button>
    </Card.Footer>
</Card.Root>
