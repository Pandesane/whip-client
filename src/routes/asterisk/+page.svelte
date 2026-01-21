<script lang="ts">
	import { UA, WebSocketInterface, debug } from 'jssip';
	import type { RTCSession, RTCSessionEventMap } from 'jssip/lib/RTCSession';

	// import JsSIP from 'jssip';

	import type {
		IncomingRTCSessionEvent,
		OutgoingRTCSessionEvent,
		UAConfiguration
	} from 'jssip/lib/UA';
	import { onMount } from 'svelte';
	import AsteriskCallState from './asterisk.svelte';
	// let contactToCall: string = $state('0');
	// let isRegistering: boolean = $state(true);
	// let incomingCall: boolean = $state(false);
	// let callButtonText: string = $derived.by(() => {
	// 	if (incomingCall) {
	// 		return 'Answer';
	// 	}
	// 	return 'Call';
	// });

	// let rtcSession: RTCSession | undefined = $state();
	// let authID = $state('');
	// // let authName = 'WS_PHONE_A';
	// // let authPassword = 'spiderwrench';
	// let authPassword = $state('');
	// let hostIpOrName = 'localhost';
	// let register = true;
	// // let extension = 246;
	// let ua: UA | undefined = $state();

	// // let videoElement: HTMLVideoElement;
	let audioElement: HTMLAudioElement;
	// function setUpUA() {}

	// // debug.enable('JsSIP:*');
	// debug.disable();

	// function makeRegistration() {
	// 	console.log('Making new account registration');
	// 	let socket = new WebSocketInterface('ws://' + hostIpOrName + ':8088/ws');
	// 	// let uri = 'sip:' + id + '@' + hostIpOrName;
	// 	let uri = 'sip:' + authID + '@' + hostIpOrName;

	// 	let config: UAConfiguration = {
	// 		sockets: [socket],
	// 		uri: uri,
	// 		// contact_uri: uri,

	// 		// authorization_user: authName,
	// 		authorization_user: authID,
	// 		// username: authName,
	// 		password: authPassword,
	// 		register: register,
	// 		register_expires: 300,
	// 		realm: 'asterisk',
	// 		session_timers: false
	// 	};

	// 	// this._unified = isUnifiedPlanDefault();

	// 	ua = new UA(config);

	// 	ua.on('connected', (event) => {
	// 		console.log(event.socket.url);
	// 		event.socket.ondata = (event) => {
	// 			// console.log(event);
	// 		};
	// 	});

	// 	ua.on('sipEvent', (event) => {
	// 		// console.log(event.request);
	// 	});

	// 	// ua.on("")

	// 	ua.on('newRTCSession', (data: IncomingRTCSessionEvent | OutgoingRTCSessionEvent) => {
	// 		let rtc = data.session;
	// 		rtcSession = rtc;
	// 		incomingCall = true;
	// 		switch (rtc.direction) {
	// 			case 'incoming':
	// 				console.log('Incoming Call');
	// 				// handleIncomingCall(rtc);
	// 				break;

	// 			case 'outgoing':
	// 				console.log('Outgoing Call');
	// 				handleOutgoingCall(rtc);
	// 				break;
	// 		}
	// 		// console.log('Receiving call data', rtc);
	// 	});

	// 	ua.on('registered', () => {
	// 		console.log('Registered to asterisk');
	// 	});

	// 	ua.on('registrationFailed', (event) => {
	// 		console.log('Failed to Register to asterisk', event.cause);
	// 		console.log(event.response, ua!.status);
	// 		// ua.register()
	// 		let reg = ua!.registrator();
	// 		reg.setExtraHeaders([]);
	// 	});

	// 	ua.start();
	// 	// ua = ua
	// }
	// function handleIncomingCall(rtcSession: RTCSession) {
	// 	rtcSession.answer();
	// }

	// function handleOutgoingCall(rtcSession: RTCSession) {}

	// function registerAccount() {
	// 	isRegistering = !isRegistering;
	// 	if (authID.trim() != '' && authPassword.trim() != '') {
	// 		if (ua == undefined || ua?.isRegistered() == false) {
	// 			console.log('Making Registration');
	// 			makeRegistration();
	// 		}
	// 	}
	// }

	// function makeCall() {
	// 	// @ts-ignore
	// 	let eventHandlers: RTCSessionEventMap = {
	// 		progress: (e: any) => {
	// 			console.log('call is in progress');
	// 		},
	// 		failed: function (e) {
	// 			console.log('call failed with cause: ');
	// 		},
	// 		ended: function (e) {
	// 			console.log('call ended with cause: ');
	// 		},
	// 		confirmed: function (e: any) {
	// 			console.log('call confirmed');
	// 		}
	// 	};

	// 	var options = {
	// 		eventHandlers: eventHandlers,
	// 		// mediaConstraints: { audio: true, video: true },
	// 		mediaConstraints: { audio: true, video: false }
	// 	};

	// 	if (ua != undefined || (contactToCall != '0' && contactToCall.trim() != '')) {
	// 		console.log('Making Call');
	// 		rtcSession = ua!.call(`sip:${contactToCall}@localhost`, options);
	// 		rtcSession.connection.ontrack = (event) => {
	// 			console.log('Adding Streams');
	// 			console.log('Stream: ', event.streams[0]);
	// 			// videoElement!.srcObject = event.streams[0];
	// 			// videoElement.muted = false;
	// 			audioElement!.srcObject = event.streams[0];
	// 			audioElement.muted = false;
	// 			// videoElement.play();
	// 		};
	// 	}
	// }

	// function call() {
	// 	if (incomingCall) {
	// 		handleIncomingCall(rtcSession!);
	// 	} else {
	// 		makeCall();
	// 	}
	// 	incomingCall = false;
	// }

	let asteriskCallState: AsteriskCallState = new AsteriskCallState();

	onMount(() => {
		// ua.start();
		// ua.register();
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

<!-- <video bind:this={videoElement} muted autoplay class=""></video> -->
<audio bind:this={audioElement} muted autoplay class=""></audio>
