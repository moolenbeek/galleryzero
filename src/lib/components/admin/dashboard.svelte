<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';

    export let data: { user: { id: string; username: string; role: string } };
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
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Description</Table.Head>
                    <Table.Head>Category</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>Name</Table.Cell>
                    <Table.Cell>Description</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table.Root>
    </Card.Content>
</Card.Root>
