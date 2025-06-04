<script>
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let lobbyCode = '';

	async function joinLobby() {
		const currentUser = pb.authStore.model.id;
		const lobby = await pb.collection('lobbies').getFirstListItem(`code="${lobbyCode}"`);

		if (!lobby.player2) {
			await pb.collection('lobbies').update(lobby.id, { player2: currentUser });
		}

		goto(`/game/${lobbyCode}`);
	}
</script>

<h2 class="text-xl font-bold">Lobby beitreten</h2>
<input bind:value={lobbyCode} class="input input-bordered mt-2" placeholder="Lobby-Code eingeben" />
<button class="btn btn-secondary mt-2" on:click={joinLobby}>Beitreten</button>
