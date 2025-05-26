<script>
	import { pb } from '$lib/pocketbase';
	let username = '',
		password = '';
	async function register() {
		await pb.collection('users').create({ username, password, passwordConfirm: password });
	}
</script>

<input bind:value={username} placeholder="Username" />
<input type="password" bind:value={password} placeholder="Passwort" />
<button on:click={register}>Registrieren</button>
