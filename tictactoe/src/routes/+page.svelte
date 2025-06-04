<!-- src/routes/lobby/+page.svelte -->
<script>
	import { goto } from '$app/navigation';
</script>

<h1 class="mb-4 text-2xl font-bold">Lobby-Menü</h1>

<div class="flex flex-col gap-2">
	<button class="btn btn-primary" on:click={() => goto('/lobby/create')}
		>🎮 Neue Lobby erstellen</button
	>
	<button class="btn btn-secondary" on:click={() => goto('/lobby/join')}>Lobby beitreten</button>
	<button class="btn btn-secondary" on:click={() => goto('/lobby/register')}>Registrieren</button>
	<button class="btn btn-secondary" on:click={() => goto('/lobby/login')}>Login</button>
</div>
