<script lang="ts">
	import { onMount } from 'svelte';
	// import { WHIPClientTS } from './whip.bak.ts';
	import { WHIPClientTSChannel } from './whip_channel_sender.ts';
	import { WHEPClientTSChannel } from './whep_channel.ts';
	// import { WHEPClient } from './whep';
	// import FlvJs from 'flv.js';
	// import WhipChannel from '$lib/sockets/whip_channel';
	let url = 'http://localhost:1985/rtc/v1/whip/?app=live&stream=livestream&eip=192.168.3.10';
	// let flvUrl = 'http://localhost:8080/live/livestream.flv?eip=192.168.3.10';
	// let whepUrl = 'http://localhost:1985/rtc/v1/whep/?app=live&stream=pande';

	let videoPlayer: HTMLVideoElement;

	//Get mic+cam

	// @ts-ignore
	async function startVideoStream() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

		//Create peerconnection
		const pc = new RTCPeerConnection({ bundlePolicy: 'max-bundle' });

		//Send all tracks
		for (const track of stream.getTracks()) {
			//You could add simulcast too here
			pc.addTransceiver(track, { direction: 'sendonly' });
		}

		//Create whip client
		const whip = new WHIPClientTSChannel();

		// const url = 'http://localhost:1985/rtc/v1/whip/?app=live&stream=pande&eip=192.168.3.10';
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IndoaXAgdGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.jpM01xu_vnSXioxQ3I7Z45bRh5eWRBEY2WJPZ6FerR8';

		//Start publishing
		whip.publish(pc, url, token);
	}

	async function acceptWhepStreams() {
		//Create peerconnection
		const pc = new RTCPeerConnection({ bundlePolicy: 'max-bundle' });

		//Add recv only transceivers
		pc.addTransceiver('audio');
		pc.addTransceiver('video');

		pc.ontrack = (event) => {
			console.log(event);
			// if (event.track.kind == 'video')
			videoPlayer.srcObject = event.streams[0];
		};

		//Create whep client
		const whep = new WHEPClientTSChannel();

		//Start viewing
		whep.view(pc);
	}

	async function run() {
		// await startVideoStream();
		await acceptWhepStreams()
	}
	onMount(() => {
		run();
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video bind:this={videoPlayer} autoplay controls></video>
