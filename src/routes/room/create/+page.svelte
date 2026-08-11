<script lang="ts">
	import { RoomManager } from '$lib/confrence/RoomManager';
	import { RoomMediaManager } from '$lib/confrence/RoomMediaManager';
	import RoomChannelHelper from '$lib/sockets/channel_helpers/RoomChannelHelper';
	import { onMount } from 'svelte';

	let roomName: string = $state('');
	let userName: string = $state('');
	let videoElement: HTMLMediaElement;
	let remoteMediaContainer: HTMLDivElement;

	let room: RoomManager | undefined = $state();
  let roomMediaManager: RoomMediaManager

  onMount(()=>{
   roomMediaManager = new RoomMediaManager(remoteMediaContainer)

  })

  function createRoom() {
		console.log(roomName);
		if (roomName != '') {
			RoomChannelHelper.createRoom(roomName, userName, (token) => {
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

<!-- <form ></form>  -->

<p>Create Room</p>

<label for="room_name" class="block">Room Name</label>
<input class="block" type="text" name="room_name" bind:value={roomName} />

<label for="user_name" class="block">User Name</label>
<input class="block" type="text" name="user_name" bind:value={userName} />

{#if !room}
	<button
		class="mt-4 block w-20 rounded-md bg-blue-600 p-2 text-white"
		onclick={() => {
			createRoom();
		}}>Create</button
	>
{:else}
	<button
		class="mt-4 block w-20 rounded-md bg-red-600 p-2 text-white"
		onclick={() => {
			room?.leaveRoom();
			room = undefined;
		}}>Leave</button
	>
	<video class="w-full" bind:this={videoElement} autoplay controls></video>
{/if}

<div bind:this={remoteMediaContainer} class="grid w-full grid-cols-2"></div>
