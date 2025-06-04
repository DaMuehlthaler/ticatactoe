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

	// 🟢 Laden der Lobby + Realtime Sync
	onMount(async () => {
		try {
			const result = await pb.collection('lobbies').getFirstListItem(`code="${code}"`, {
				expand: 'player1,player2'
			});

			lobby = result;
			board = [...lobby.boardState];

			mySymbol = currentUser === lobby.player1 ? 'X' : 'O';

			unsubscribe = await pb.collection('lobbies').subscribe(lobby.id, (e) => {
				lobby = e.record;
				board = [...e.record.boardState];
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

	// 🔁 Spiellogik mit 3-Stein-Regel
	async function playMove(index) {
		if (!lobby) return;
		if (lobby.winner) return;
		if (lobby.currentTurn !== mySymbol) return;
		if (board[index]) return;

		if (myMoves.length >= 3) {
			const removeIndex = myMoves.shift();
			board[removeIndex] = null;
		}

		myMoves.push(index);
		board[index] = mySymbol;

		let winner = null;
		if (checkWin(board, mySymbol)) {
			winner = mySymbol;
			await pb.collection('highscores').create({
				userId: currentUser,
				lobbyId: lobby.id,
				movesToWin: lobby.moves + 1
			});
		}

		await pb.collection('lobbies').update(lobby.id, {
			boardState: board,
			currentTurn: mySymbol === 'X' ? 'O' : 'X',
			moves: lobby.moves + 1,
			winner
		});
	}

	// 🧠 Gewinnüberprüfung
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

	// 🧹 Lobby verlassen (optional Reset)
	async function leaveLobby() {
		// Optional: cleanup nur wenn Spiel noch läuft
		if (!lobby.winner && (mySymbol === 'X' || mySymbol === 'O')) {
			await pb.collection('lobbies').update(lobby.id, {
				boardState: Array(9).fill(null),
				currentTurn: 'X',
				moves: 0,
				winner: null
			});
		}
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
	{#if lobby.winner}
		<p class="text-lg font-semibold text-green-600">🎉 Spieler {lobby.winner} hat gewonnen!</p>
	{/if}

	<div class="mt-4 grid w-64 grid-cols-3 gap-2">
		{#each board as cell, i}
			<button
				class="btn btn-square text-2xl"
				on:click={() => playMove(i)}
				disabled={cell || lobby.currentTurn !== mySymbol || lobby.winner}
			>
				{cell}
			</button>
		{/each}
	</div>

	<!-- Button zum Verlassen -->
	<button class="btn btn-error mt-4" on:click={leaveLobby}>🚪 Lobby verlassen</button>
{/if}
