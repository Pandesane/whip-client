<script lang="ts">
	import { onMount } from 'svelte';
	import AsteriskCallState from './asterisk.svelte';

	let asteriskCallState: AsteriskCallState = new AsteriskCallState();
	let audioElement: HTMLAudioElement;

	onMount(() => {
		asteriskCallState.setAudioElement(audioElement);
		return () => {
			asteriskCallState.ua?.stop();
		};
	});
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="mt-4">
		{#if asteriskCallState.isRegistering}
			<div class="mx-4 flex w-[80%] flex-col justify-center">
				<p>Register a new Account</p>
				<div class="my-4 flex flex-col">
					<label for="authID">Name</label>
					<input id="authID" type="text" bind:value={asteriskCallState.authID} class="w-full" />
				</div>

				<div class="my-4 flex flex-col">
					<label for="authPassword">Password</label>
					<input type="text" bind:value={asteriskCallState.authPassword} id="authPassword" />
				</div>
			</div>
		{:else}
			<div class="flex w-full justify-center">
				<input type="text" class="rounded-md px-4" bind:value={asteriskCallState.contactToCall} />
			</div>
		{/if}
	</div>

	<div class="mt-4 flex justify-center">
		<div class="flex w-[50%] justify-between">
			<button
				onclick={() => {
					asteriskCallState.registerAccount();
				}}
				class="btn rounded-md bg-blue-600 p-2 px-6 text-white">Register</button
			>
			<button
				onclick={() => {
					asteriskCallState.call();
				}}
				class="btn rounded-md bg-orange-600 p-2 px-6 text-white"
				>{asteriskCallState?.callButtonText}</button
			>
		</div>
	</div>
</div>

{#if asteriskCallState.incomingCall}
	<!-- content here -->
	<div class="h-50 w-50 bg-red-500">Pande</div>
{:else}
	<div class="h-50 w-50 bg-green-500">Pande</div>
{/if}

<!-- <video bind:this={videoElement} muted autoplay class=""></video> -->
<audio bind:this={audioElement} muted volume={0} autoplay class=""></audio>
