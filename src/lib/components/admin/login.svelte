<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../routes/admin/login/$types';
    import { Button } from '$lib/components/ui/button';
    import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from '$lib/components/ui/input';
	export let form: ActionData;
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Login/Register</Card.Title>
    </Card.Header>
	<Card.Content>
		<form method='post' action='?/login' use:enhance>
			<label>
				Username
				<Input name='username' />
			</label>
			<label>
				Password
				<Input type='password' name='password' />
			</label>
			<div class="flex gap-2 pt-4">
				<Button type="submit">Login</Button>
				<Button formaction='?/register'>Register</Button>
			</div>
		</form>
		<p style='color: red'>{form?.message ?? ''}</p>
	</Card.Content>
</Card.Root>
