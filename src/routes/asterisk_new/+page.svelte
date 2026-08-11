<script lang="ts">
	import { onMount } from 'svelte';
	import { AsteriskSingleton } from '$lib/asterisk/asterisk.svelte';

	// let asterisk: AsteriskCallState = new AsteriskCallState();
	let asterisk = AsteriskSingleton.getAsteriskServer();
	let audioElement: HTMLAudioElement;
	let authID: string | undefined = $state('WS_PHONE_A');
	let authPassword: string | undefined = $state('pande');
	let contactToCall: string | undefined = $state();

	onMount(() => {
		return () => {
			asterisk.ua?.stop();
		};
	});

	function loadRemoteAudio(mediaElement: HTMLMediaElement) {
		if (asterisk.isInCall) {
			mediaElement.srcObject = asterisk.combinedStream!;
			asterisk.setRemoteMediaElement(mediaElement);
		}
		return () => {
			mediaElement.srcObject = null;
			asterisk.setRemoteMediaElement(undefined);
		};
	}

	function loadRemoteVideo(mediaElement: HTMLMediaElement) {
		if (asterisk.isVideoCall) {
			mediaElement.srcObject = asterisk.combinedStream!;
			asterisk.setRemoteMediaElement(mediaElement);
		}
		return () => {
			mediaElement.srcObject = null;
			asterisk.setRemoteMediaElement(undefined);
		};
	}
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="mt-4">
		{#if !asterisk.isRegistered}
			<div class="mx-2 flex w-[80%] flex-col justify-center">
				<p>Register a new Account</p>
				<div class="my-4 flex flex-col">
					<label for="authID">Name</label>
					<input id="authID" type="text" bind:value={authID} class="w-full" />
				</div>

				<div class="my-4 flex flex-col">
					<label for="authPassword">Password</label>
					<input type="text" bind:value={authPassword} id="authPassword" />
				</div>
			</div>
		{:else}
			<div class="flex w-full justify-center">
				<input type="text" class="rounded-md px-4" bind:value={contactToCall} />
			</div>
		{/if}
	</div>

	<div class="mt-4 flex justify-center">
		<div class="flex w-full justify-evenly">
			{#if !asterisk.isRegistered}
				<button
					onclick={() => {
						if (authID && authPassword) {
							asterisk.registerToAsterisk(authID, authPassword);
						}
					}}
					class="btn rounded-md bg-blue-600 p-2 px-6 text-white">Register</button
				>
			{:else}
				<button
					onclick={() => {
						if (asterisk.isInCall) {
							asterisk.endCall();
						} else {
							if (contactToCall) asterisk.call(contactToCall);
						}
					}}
					class="btn rounded-md bg-orange-600 p-2 px-6 text-white">Audio Call</button
				>

				<button
					onclick={() => {
						if (asterisk.isInCall) {
							asterisk.endCall();
						} else {
							if (contactToCall) asterisk.videoCall(contactToCall);
						}
					}}
					class="btn rounded-md bg-orange-600 p-2 px-6 text-white">Video Call</button
				>
			{/if}
		</div>
	</div>
</div>


<!-- <video bind:this={videoElement} muted autoplay class=""></video> -->
{#if asterisk.isInCall && asterisk.isVideoCall}
	<a href="/asterisk_new/video" aria-label="Open video Progress Page">
		<video
			{@attach loadRemoteVideo}
			autoplay
			class="fixed right-2 bottom-40 z-100 h-40 w-40 bg-black"
		></video>
	</a>
{:else if asterisk.isInCall && !asterisk.isVideoCall}
	<audio {@attach loadRemoteAudio} autoplay></audio>
{/if}
