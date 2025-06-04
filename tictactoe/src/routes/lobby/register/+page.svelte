<script>
	import { pb } from '$lib/pocketbase';

	let email = '';
	let password = '';
	let passwordConfirm = '';
	let error = '';

	async function register() {
		error = '';

		if (password !== passwordConfirm) {
			error = 'Passwörter stimmen nicht überein';
			return;
		}

		try {
			await pb.collection('users').create({
				email,
				password,
				passwordConfirm
			});

			alert('Registrierung erfolgreich!');
		} catch (err) {
			error = 'Fehler: ' + err.message;
		}
	}
</script>

<h2>Registrieren</h2>
{#if error}
	<p style="color: red">{error}</p>
{/if}
<input placeholder="Email" bind:value={email} />
<input type="password" placeholder="Passwort" bind:value={password} />
<input type="password" placeholder="Passwort wiederholen" bind:value={passwordConfirm} />
<button on:click={register}>Registrieren</button>
