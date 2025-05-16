<script>
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    let lobbyCode = '';
    async function join() {
      const result = await pb.collection('lobbies').getFirstListItem(`code="${lobbyCode}"`);
      if (!result.player2) {
        await pb.collection('lobbies').update(result.id, { player2: pb.authStore.model.id });
      }
      goto(`/game/${lobbyCode}`);
    }
  </script>
  <input bind:value={lobbyCode} placeholder="Lobby-Code" />
  <button on:click={join}>Beitreten</button>