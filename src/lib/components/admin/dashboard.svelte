<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { enhance } from '$app/forms';

    export let data: { user: { id: string; username: string; role: string } };
</script>

<h1>Dashboard Component</h1>
<p>Hi {data.user.username}</p>
<form method="post" action="?/logout" use:enhance>
    <Button type="submit">Log out</Button>
</form>