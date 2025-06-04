<script>
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	async function createLobby() {
		const currentUser = pb.authStore.model.id;
		const code = Math.random().toString(36).substring(2, 6).toUpperCase();
		const newLobby = await pb.collection('lobbies').create({
			player1: currentUser,
			code,
			boardState: Array(9).fill(null),
			currentTurn: 'X',
			moves: 0
		});
		goto(`/game/${code}`);
	}
</script>

<h2 class="text-xl font-bold">Neue Lobby erstellen</h2>
<button class="btn btn-primary mt-4" on:click={createLobby}>Lobby erstellen</button>
