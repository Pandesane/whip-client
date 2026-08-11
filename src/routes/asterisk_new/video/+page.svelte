<script lang="ts">
	import { AsteriskSingleton } from '$lib/asterisk/asterisk.svelte';
	import type CallIcon from '$lib/interfaces/CallIcons';

	let asterisk = AsteriskSingleton.getAsteriskServer();
	let remoteMediaElement: HTMLMediaElement;
	let canvasElement: HTMLCanvasElement;

	let callIcons: CallIcon[] = [
		{
			icon: 'icon-[hugeicons--call-paused-02]',
			label: 'hold',
			callback: () => {
				console.log('Holding Call');
				// asterisk.toggleHold();
				// remoteMediaElement.play();
			}
		},
		{
			label: 'mute',
			icon: 'icon-[hugeicons--volume-mute-02]',
			callback: () => {
				console.log('Muting Call');
				asterisk.toggleMute();
			}
		},
		{
			icon: 'icon-[ic--round-call-end]',
			label: 'hang up',
			callback: () => {
				console.log('Ending Call');
				asterisk.endCall();
			}
		},
		{
			icon: 'icon-[hugeicons--music-note-square-01]',
			label: 'Switch to Audio Call',
			callback: () => {
				console.log('Switching to Audio Call');
			}
		}
	];

	// $effect(() => {
	//   // This causes the website to navigate to previous page in case of a call ending
	//   if (!asterisk.isInCall && page.url.pathname == "/callprogress/video") {
	//     history.back();
	//   }
	// });
	function loadRemoteVideo(mediaElement: HTMLMediaElement) {
		if (asterisk.isVideoCall) {
			mediaElement.srcObject = asterisk.combinedStream!;
			asterisk.setRemoteMediaElement(mediaElement);
			console.log(mediaElement.srcObject);
			loadAudioVisualizer(asterisk.combinedStream!, canvasElement);
			if (asterisk.receivingCall) {
				loadAudioVisualizer(asterisk.incomingCombinedAudioStream!, canvasElement);
				console.log(asterisk.incomingCombinedAudioStream);
			} else {
				loadAudioVisualizer(asterisk.combinedStream!, canvasElement);
			}
		}
		return () => {
			asterisk.setRemoteMediaElement(undefined);
			mediaElement.srcObject = null;
		};
	}

	function loadLocalVideo(mediaElement: HTMLMediaElement) {
		if (asterisk.isVideoCall) {
			mediaElement.srcObject = asterisk.localMediaStream!;
		}
		return () => {
			mediaElement.srcObject = null;
		};
	}

	function loadAudioVisualizer(stream: MediaStream, canvas: HTMLCanvasElement) {
		let context = canvas.getContext('2d');
		let audioContext = new AudioContext();
		let source = audioContext.createMediaStreamSource(stream);
		let analyser = audioContext.createAnalyser();
		analyser.fftSize = 32;

		source.connect(analyser);
		analyser.connect(audioContext.destination);
		console.log(context);
		console.log(audioContext);
		console.log(analyser);
		drawVisualizer(analyser, context!);
	}

	function drawVisualizer(analyser: AnalyserNode, ctx: CanvasRenderingContext2D) {
		requestAnimationFrame(() => drawVisualizer(analyser, ctx));

		let bufferLength = analyser.frequencyBinCount;
		let dataArray = new Uint8Array(bufferLength);
		// let dataFloatArray = new Float32Array(bufferLength);
		// console.log(dataArray);
		// console.log(dataFloatArray);
		analyser.getByteTimeDomainData(dataArray);
		// analyser.getFloatTimeDomainData(dataFloatArray);
		// console.log(dataArray);
		// console.log(dataFloatArray);

		ctx.fillStyle = 'rgb(20 , 20,20)';
		ctx.fillRect(0, 0, 300, 300);

		const barWidth = (300 / bufferLength) * 1.5;
		let barHeight = 0;
		let x = 0;

		for (let i = 0; i < bufferLength; i++) {
			barHeight = dataArray[i];

			ctx.fillStyle = `rgb(${barHeight + 100}, 150, 250)`;

			ctx.fillRect(x, 300 - barHeight, barWidth, barHeight);

			x += barWidth;
			// console.log(x)
		}
		// ctx.fillStyle = "rgb(250 , 250,250)";

		// ctx.fillText("Pande anaylyzer!!", 120, 150);
	}
</script>

<!-- <TopNavBar title="Name of Person" /> -->

<div class="relative mt-14 h-[80vh] w-full bg-red-200">
	<canvas
		bind:this={canvasElement}
		width="300"
		height="300"
		class="absolute top-0 z-100 bg-green-600"
	></canvas>

	<!-- Remote Video -->
	<div class="h-full w-full">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			{@attach loadRemoteVideo}
			autoplay
			bind:this={remoteMediaElement}
			crossorigin="anonymous"
			class=" h-full w-full bg-black object-contain"
		></video>
	</div>

	<!-- My Video -->
	<div class="absolute right-2 bottom-2 z-10 w-[200px]">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			{@attach loadLocalVideo}
			autoplay
			muted
			class=" h-full w-full bg-orange-500 object-contain"
		></video>
	</div>
</div>

<!-- Call controls -->

<div class="flex h-[10vh] items-center justify-around bg-red-200">
	<div>{asterisk.formattedTime}</div>
	{#each callIcons as item}
		<button
			class=""
			aria-label={item.label}
			onclick={() => {
				item.callback();
			}}
		>
			{#if item.label == 'mute'}
				<span class="{asterisk.mutedIcon} h-8 w-8"> </span>
			{:else}
				<span class="{item.icon} h-8 w-8"> </span>
			{/if}
		</button>
	{/each}
</div>
