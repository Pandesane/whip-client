
import { UA, WebSocketInterface, debug } from 'jssip';
import type { RTCSession, RTCSessionEventMap } from 'jssip/lib/RTCSession';
import type {
  IncomingRTCSessionEvent,
  OutgoingRTCSessionEvent,
  UAConfiguration
} from 'jssip/lib/UA';



export default class AsteriskCallState {
  contactToCall: string = $state('0');
  isRegistering: boolean = $state(true);
  incomingCall: boolean = $state(false);
  callButtonText: string = $derived.by(() => {
    if (this.incomingCall) {
      return 'Answer';
    }
    return 'Call';
  });
  rtcSession: RTCSession | undefined = $state();
  authID = $state('');
  authPassword = $state('');
  hostIpOrName = 'localhost';
  register = true;
  ua: UA | undefined = $state();
  audioElement?: HTMLAudioElement;
  constructor() {
  }

  setAudioElement(audioElement: HTMLAudioElement){
    this.audioElement = audioElement
  }

  makeRegistration() {
    console.log('Making new account registration');
    let socket = new WebSocketInterface('ws://' + this.hostIpOrName + ':8088/ws');
    // let uri = 'sip:' + id + '@' + hostIpOrName;
    let uri = 'sip:' + this.authID + '@' + this.hostIpOrName;

    let config: UAConfiguration = {
      sockets: [socket],
      uri: uri,
      // contact_uri: uri,

      // authorization_user: authName,
      authorization_user: this.authID,
      // username: authName,
      password: this.authPassword,
      register: this.register,
      register_expires: 300,
      realm: 'asterisk',
      session_timers: false
    };

    // this._unified = isUnifiedPlanDefault();

    this.ua = new UA(config);

    this.ua.on('connected', (event) => {
      console.log(event.socket.url);
      event.socket.ondata = (event) => {
        // console.log(event);
      };
    });

    this.ua.on('sipEvent', (event) => {
      // console.log(event.request);
    });

    this.ua.on('newRTCSession', (data: IncomingRTCSessionEvent | OutgoingRTCSessionEvent) => {
      let rtc = data.session;
      this.rtcSession = rtc;
      this.incomingCall = true;
      switch (rtc.direction) {
        case 'incoming':
          console.log('Incoming Call');
          // handleIncomingCall(rtc);
          break;

        case 'outgoing':
          console.log('Outgoing Call');
          this.handleOutgoingCall(rtc);
          break;
      }
      // console.log('Receiving call data', rtc);
    });

    this.ua.on('registered', () => {
      console.log('Registered to asterisk');
    });

    this.ua.on('registrationFailed', (event) => {
      console.log('Failed to Register to asterisk', event.cause);
      console.log(event.response, this.ua!.status);
      // ua.register()
      let reg = this.ua!.registrator();
      reg.setExtraHeaders([]);
    });

    this.ua.start();
    // ua = ua
  }
  handleIncomingCall(rtcSession: RTCSession) {
    rtcSession.answer();
  }

  handleOutgoingCall(rtcSession: RTCSession) { }

  registerAccount() {
    this.isRegistering = !this.isRegistering;
    if (this.authID.trim() != '' && this.authPassword.trim() != '') {
      if (this.ua == undefined || this.ua?.isRegistered() == false) {
        console.log('Making Registration');
        this.makeRegistration();
      }
    }
  }

  makeCall() {
    // @ts-ignore
    let eventHandlers: RTCSessionEventMap = {
      progress: (e: any) => {
        console.log('call is in progress');
      },
      failed: function (e) {
        console.log('call failed with cause: ');
      },
      ended: function (e) {
        console.log('call ended with cause: ');
      },
      confirmed: function (e: any) {
        console.log('call confirmed');
      }
    };

    var options = {
      eventHandlers: eventHandlers,
      // mediaConstraints: { audio: true, video: true },
      mediaConstraints: { audio: true, video: false }
    };

    if (this.ua != undefined || (this.contactToCall != '0' && this.contactToCall.trim() != '')) {
      console.log('Making Call');
      this.rtcSession = this.ua!.call(`sip:${this.contactToCall}@localhost`, options);
      this.rtcSession.connection.ontrack = (event) => {
        console.log('Adding Streams');
        console.log('Stream: ', event.streams[0]);
        // videoElement!.srcObject = event.streams[0];
        // videoElement.muted = false;
        this.audioElement!.srcObject = event.streams[0];
        this.audioElement!.muted = false;
        // videoElement.play();
      };
    }
  }

  call() {
    if (this.incomingCall) {
      this.handleIncomingCall(this.rtcSession!);
    } else {
      this.makeCall();
    }
    this.incomingCall = false;
  }



}