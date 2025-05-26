<script>
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';

	let highscores = [];

	onMount(async () => {
		const result = await pb.collection('highscores').getFullList({
			sort: '+movesToWin',
			expand: 'userId,lobbyId'
		});
		highscores = result;
	});
</script>

<h1 class="mb-4 text-2xl font-bold">🏆 Highscores</h1>

<table class="table-zebra table w-full">
	<thead>
		<tr>
			<th>Platz</th>
			<th>Spieler</th>
			<th>Züge</th>
			<th>Datum</th>
		</tr>
	</thead>
	<tbody>
		{#each highscores as score, i}
			<tr>
				<td>{i + 1}</td>
				<td>{score.expand.userId?.username}</td>
				<td>{score.movesToWin}</td>
				<td>{new Date(score.created).toLocaleString()}</td>
			</tr>
		{/each}
	</tbody>
</table>
