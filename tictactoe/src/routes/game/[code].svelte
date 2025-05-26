<script>
	import { onMount, onDestroy } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	export let code;

	let lobby = null;
	let error = '';
	let unsubscribe = null;

	let currentUser = pb.authStore.model?.id;
	let mySymbol = '';
	let board = Array(9).fill(null);
	let myMoves = [];

	let waitingForPlayer = false;

	onMount(async () => {
		try {
			const result = await pb.collection('lobbies').getFirstListItem(`code="${code}"`, {
				expand: 'player1,player2'
			});

			lobby = result;
			board = [...lobby.boardState];

			// Zugriffsschutz: nur player1 oder player2 dürfen in die Lobby
			if (currentUser !== lobby.player1 && currentUser !== lobby.player2) {
				error = 'Du bist kein Teilnehmer dieser Lobby.';
				setTimeout(() => goto('/lobby/join'), 2000);
				return;
			}

			// Spieler-Zeichen setzen
			mySymbol = currentUser === lobby.player1 ? 'X' : 'O';

			// Warten auf zweiten Spieler?
			waitingForPlayer = !lobby.player1 || !lobby.player2;

			// Realtime Sync
			unsubscribe = await pb.collection('lobbies').subscribe(lobby.id, (e) => {
				lobby = e.record;
				board = [...e.record.boardState];
				waitingForPlayer = !lobby.player1 || !lobby.player2;
			});
		} catch (err) {
			console.error(err);
			error = 'Lobby nicht gefunden.';
			setTimeout(() => goto('/lobby/join'), 2000);
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function playMove(index) {
		if (!lobby || waitingForPlayer) return;
		if (lobby.winner) return;
		if (lobby.currentTurn !== mySymbol) return;
		if (board[index]) return;

		// 3-Stein-Regel anwenden
		if (myMoves.length >= 3) {
			const removeIndex = myMoves.shift();
			board[removeIndex] = null;
		}

		myMoves.push(index);
		board[index] = mySymbol;

		// Sieg prüfen
		let winner = null;
		if (checkWin(board, mySymbol)) {
			winner = mySymbol;
			// Highscore speichern
			await pb.collection('highscores').create({
				userId: currentUser,
				lobbyId: lobby.id,
				movesToWin: lobby.moves + 1
			});
		}

		// Update Lobby in DB
		await pb.collection('lobbies').update(lobby.id, {
			boardState: board,
			currentTurn: mySymbol === 'X' ? 'O' : 'X',
			moves: lobby.moves + 1,
			winner
		});
	}

	function checkWin(b, symbol) {
		const wins = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6]
		];
		return wins.some((line) => line.every((i) => b[i] === symbol));
	}

	async function resetLobby() {
		if (pb.authStore.model.id !== lobby.player1) return; // Nur Player1 darf zurücksetzen

		await pb.collection('lobbies').update(lobby.id, {
			boardState: Array(9).fill(null),
			currentTurn: 'X',
			moves: 0,
			winner: null
		});
	}

	async function leaveLobby() {
		if (!lobby) return;

		// Bestimme, ob user player1 oder player2 ist
		const updateData = {};
		if (pb.authStore.model.id === lobby.player1) {
			updateData.player1 = null;
		} else if (pb.authStore.model.id === lobby.player2) {
			updateData.player2 = null;
		}

		await pb.collection('lobbies').update(lobby.id, updateData);
		goto('/lobby');
	}
</script>

{#if error}
	<p class="text-red-500">{error}</p>
{:else if !lobby}
	<p>Lade Lobby...</p>
{:else}
	<h2 class="mb-4 text-xl font-bold">Lobby: {lobby.code}</h2>
	<p>Du spielst als: <strong>{mySymbol}</strong></p>
	<p class="mb-2">Aktueller Zug: {lobby.currentTurn}</p>

	{#if waitingForPlayer}
		<p class="font-semibold text-yellow-600">⏳ Warten auf zweiten Spieler...</p>
	{:else if lobby.winner}
		<p class="text-lg font-semibold text-green-600">🎉 Spieler {lobby.winner} hat gewonnen!</p>
	{/if}

	<div class="mt-4 grid w-64 grid-cols-3 gap-2">
		{#each board as cell, i}
			<button
				class="btn btn-square text-2xl"
				on:click={() => playMove(i)}
				disabled={cell || lobby.currentTurn !== mySymbol || lobby.winner || waitingForPlayer}
			>
				{cell}
			</button>
		{/each}
	</div>
{/if}
<!-- 🆕 Hier kommt der Button hin -->
<button class="btn btn-error mt-4" on:click={leaveLobby}> 🚪 Lobby verlassen </button>
