<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { RoomManager } from '$lib/confrence/RoomManager';
	import { RoomMediaManager } from '$lib/confrence/RoomMediaManager';
	import RoomChannelHelper from '$lib/sockets/channel_helpers/RoomChannelHelper';
	import { onMount } from 'svelte';

	let room: RoomManager | undefined = $state();
	// let userName: string = $state('');
	let videoElement: HTMLMediaElement;
	let remoteMediaContainer: HTMLDivElement;
	let roomMediaManager: RoomMediaManager;

	onMount(() => {
		roomMediaManager = new RoomMediaManager(remoteMediaContainer);
		joinRoom();
	});

	function joinRoom() {
		if (browser && page.params.roomID) {
			let userName = self.crypto.randomUUID();
			RoomChannelHelper.joinRoom(page.params.roomID, userName, (token) => {
				console.log('Join User Token: ', token);
				room = new RoomManager(token, roomMediaManager);
				let connector = async () => {
					await room?.connectToRoom();
					videoElement.srcObject = room?.localMediaStream!;
					console.log('Local Media Stream: ', room?.localMediaStream!);
				};

				connector();
			});
		}
	}
</script>

<p>Join Room {page.params.roomID}</p>

<!-- <label for="user_name" class="block">User Name</label>
<input class="block" type="text" name="user_name" bind:value={userName} /> -->

	<!-- <button
		class="mt-4 block w-max rounded-md bg-blue-600 p-2 text-white"
		onclick={() => {
			joinRoom();
		}}>Join Room</button
	>
{:else} -->
	<button
		class="mt-4 block w-20 rounded-md bg-red-600 p-2 text-white"
		onclick={() => {
			room?.leaveRoom();
      goto("/room/index")
			room = undefined;
		}}>Leave</button
	>
	<video class="w-full" bind:this={videoElement} autoplay controls></video>

<div bind:this={remoteMediaContainer} class="grid w-full grid-cols-2"></div>
