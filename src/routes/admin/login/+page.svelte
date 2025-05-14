<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
    import { Button } from '$lib/components/ui/button';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Login/Register</h1>
<form method='post' action='?/login' use:enhance>
	<label>
		Username
		<input name='username' />
	</label>
	<label>
		Password
		<input type='password' name='password' />
	</label>
	<Button type="submit">Login</Button>
	<Button formaction='?/register'>Register</Button>
</form>
<p style='color: red'>{form?.message ?? ''}</p>
