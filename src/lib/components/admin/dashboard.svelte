<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';

    export let data: { user: { id: string; username: string; role: string } };
</script>

<h1>Dashboard Component</h1>

<Card.Root>
    <Card.Content>
        <p>Hi {data.user.username}</p>
        <form method="post" action="?/logout" use:enhance>
            <div class="flex gap-2 pt-4">
                <Button type="submit">Log out</Button>  
            </div>
        </form>
    </Card.Content>
</Card.Root>
