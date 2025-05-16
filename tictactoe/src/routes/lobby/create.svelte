<script>
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    function generateCode(length = 6) {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    async function createLobby() {
      const code = generateCode();
      const record = await pb.collection('lobbies').create({
        code,
        player1: pb.authStore.model.id,
        currentTurn: 'X',
        boardState: Array(9).fill(null),
        moves: 0
      });
      goto(`/game/${code}`);
    }
  </script>
  <button on:click={createLobby}>Lobby erstellen</button>