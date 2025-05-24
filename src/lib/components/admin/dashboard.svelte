<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';
    import { Input } from "$lib/components/ui/input";

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
    $: filteredItems = data.galleryItems.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each filteredItems as item}
                        <Table.Row>
                            <Table.Cell>{item.description}</Table.Cell>
                            <Table.Cell>{item.category.name}</Table.Cell>
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
