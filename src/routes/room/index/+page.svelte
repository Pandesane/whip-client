<script lang="ts">
	import { getActiveRooms } from '$lib/remote/room.remote';
	import { getActiveResourcesInfo } from 'process';

	let rooms = $derived(await getActiveRooms());
</script>

<p>Index Listing of available conferences</p>

{#each rooms as room}
	<!-- content here -->

	<a class="my-4 block" href="/room/{room.name}">Room Name: {room.name}</a>
{/each}
