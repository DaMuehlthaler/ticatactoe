<script>
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';

	let highscores = [];

	onMount(async () => {
		const records = await pb.collection('highscores').getFullList({
			sort: 'movesToWin',
			expand: 'userId'
		});
		highscores = records;
	});
</script>

<h1 class="mb-4 text-2xl font-bold">🏆 Highscores</h1>

<table class="table-zebra table w-full">
	<thead>
		<tr>
			<th>Platz</th>
			<th>Spieler</th>
			<th>Züge</th>
			<th>Zeitpunkt</th>
		</tr>
	</thead>
	<tbody>
		{#each highscores as entry, i}
			<tr>
				<td>{i + 1}</td>
				<td>{entry.expand?.userId?.username || 'Unbekannt'}</td>
				<td>{entry.movesToWin}</td>
				<td>{new Date(entry.created).toLocaleString()}</td>
			</tr>
		{/each}
	</tbody>
</table>
