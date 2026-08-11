
import { goto } from '$app/navigation';


import { UA } from 'custom_jssip';
import type { RTCSessionEventMap } from 'custom_jssip';
import type { RTCSession, UAConfiguration } from 'custom_jssip';
import { WebSocketInterface } from 'custom_jssip';
import type { IncomingRTCSessionEvent, OutgoingRTCSessionEvent } from 'custom_jssip';
import type { AsteriskMediaCallBack, VoidCallBack } from '$lib/interfaces/types';

// const HOSTIPORNAME = "pbx.pandesteve.online"
const HOSTIPORNAME = "localhost"
class Asterisk {
  authPassword: string | null = null
  authID: string | null = null
  incomingCall: boolean = $state(false);
  makingCall: boolean = $state(false);
  receivingCall: boolean = $state(false);
  isInCall: boolean = $state(false)
  rtcSession: RTCSession | undefined = $state();
  // hostIpOrName = 'localhost';
  register = true;
  ua: UA | undefined = $state();
  canMakeNextCall: boolean = $state(true)
  remoteMediaElement: HTMLMediaElement | undefined = $state();
  // localMediaElements: HTMLMediaElement[] = [];
  muted = $state(false);
  calledExtension: string | null = null
  isVideoCall = $state(false)
  combinedStream: MediaStream | undefined = $state();
  incomingCombinedAudioStream: MediaStream | undefined = $state()
  cachedCombinedStream: MediaStream | undefined;
  localMediaStream: MediaStream | undefined = $state();
  isRegistered: boolean = $state(false)

  mutedIcon = $derived.by(() => {
    if (this.muted) {
      return "icon-[hugeicons--volume-mute-02]";
    }
    return "icon-[hugeicons--volume-high]";
  });

  private renderRemoteVideoElementsCallbacks: AsteriskMediaCallBack[] = []



  // Call progress time indicator
  currentTime = $state(0)
  formattedTime = $derived.by(() => {
    return this._formatTime(this.currentTime);
  });
  contacts: any = null
  notifiedEndCall = false

  // Caller User
  incomingCallerEndpoint: string | undefined = $state()

  // User To call

  constructor() {
    // AsteriskChannelManager.callHasEndedEvent(() => {
    //   this.notifiedEndCall = true
    //   this.endCall()
    // })
  }

  // async getUser(endpoint: string | undefined) {
  //   if (endpoint) {
  //     return await getUserByEndpoint(endpoint)

  //   } else {
  //     return this.userToCall
  //   }

  // }


  setRemoteMediaElement(mediaElement: HTMLMediaElement | undefined) {
    console.log("remote media element", mediaElement)
    this.remoteMediaElement = mediaElement
    if (mediaElement) {
      mediaElement.ontimeupdate = (event) => {
        this.currentTime = (event.target as HTMLMediaElement).currentTime
      }
    }
  }

  addRenderRemoteVideoElementsCallbacks(callBack: AsteriskMediaCallBack) {
    this.renderRemoteVideoElementsCallbacks.push(callBack)
  }


  toggleHold() {
    if (this.isInCall) {
      if (this.rtcSession?.isOnHold().local) {
        this.rtcSession.unhold()
      } else {
        this.rtcSession?.hold()

      }

    }
    console.log("Running is hold", this.rtcSession?.isOnHold())

  }

  toggleMute() {
    if (this.isInCall) {
      if (this.rtcSession?.isMuted().audio) {
        this.rtcSession.unmute()
        this.muted = false
      } else {
        this.rtcSession?.mute()
        this.muted = true
      }
    }
    console.log("Running is muted", this.rtcSession?.isMuted())

  }


  registerToAsterisk(authID: string, authPassword: string) {
    this.authID = authID
    this.authPassword = authPassword
    // AsteriskChannelManager.saveChannelPid(authID)
    this._makeRegistration(authID, authPassword)
    this.combinedStream = new MediaStream()
    // this.ua!._contacts = this.contacts

  }

  handleIncomingCall(rtcSession: RTCSession) {
    console.log("RTCSession", rtcSession)
    this.canMakeNextCall = false
    this.receivingCall = true
    rtcSession.answer();
    this.incomingCombinedAudioStream = new MediaStream()
    // this.combinedStream = new MediaStream()
    let tryVideoCall = new MediaStream()
    rtcSession.connection.ontrack = (event: RTCTrackEvent) => {
      this.isInCall = true
      console.log("Streams: ", event.streams[0])
      let stream = event.streams[0]
      if (stream.active) {
        console.log("stream is active: ", stream.getTracks())
      } else {
        console.log("stream is inactive: ", stream)

      }
      this.combinedStream = stream
      stream.getTracks().forEach(track => {
        tryVideoCall.addTrack(track);
      });

      if (event.track.kind === "video") {
        this.isVideoCall = true
        this.combinedStream = tryVideoCall

      }

      stream.getTracks().forEach(track => {
        if (track.kind == "audio") {
          console.log("Audio Track", track)
          this.incomingCombinedAudioStream?.addTrack(track)

        }
      });
      this.localMediaStream = rtcSession._localMediaStream
    };
    // AsteriskChannelManager.callInProgress(this.authID!, this.calledExtension!)
    rtcSession._connection.onconnectionstatechange = () => {
      console.log("Connection state rtcSession:", rtcSession.connection.connectionState);
    };
  }

  handleOutgoingCall(rtcSession: RTCSession) {
    console.log("RTCSession", rtcSession)
    this.canMakeNextCall = false
    this.combinedStream = new MediaStream();
    this.isInCall = true
    let streamCount = 0
    rtcSession.connection.ontrack = (event: RTCTrackEvent) => {
      let stream = event.streams[0]
      // Prevent duplicates
      // const existingIds = new Set(this.combinedStream!.getTracks().map(t => t.id));


      // stream.getAudioTracks().forEach(track => {
      //   if (track.kind == "audio") {
      //     console.log("Audio Track", track)
      //   }
      // });
      streamCount++;
      console.log(`Stream ${streamCount}`, stream)
      stream.getTracks().forEach(track => {
        if (track.kind == "audio") {
          console.log("Stream Audio Track", track)
        } else {
          console.log("Stream Video Track", track)

        }
      });
      if (this.isVideoCall) {
        stream.getTracks().forEach(track => {
          this.combinedStream!.addTrack(track);
        });
      } else {
        //   this.combinedStream = stream

      }
      // if (!this.combinedStream) {
      //   this.combinedStream = stream

      // }



      this.localMediaStream = rtcSession._localMediaStream;
    };
    rtcSession._connection.onconnectionstatechange = () => {
      console.log("Connection state rtcSession:", rtcSession.connection.connectionState);
    };
  }

  call(extension: string) {
    // this.userToCall = userToCall
    if (!this.canMakeNextCall) {
      return
    }
    if (this.ua?.isRegistered) {
      if (!this.isInCall) {
        this.calledExtension = extension
        this._makeCall(extension);
      }

    }
  }


  videoCall(extension: string) {
    // this.userToCall = userToCall

    if (this.ua?.isRegistered) {
      if (!this.isInCall) {
        this.calledExtension = extension
        this._makeCall(extension, true);
      }

    }
  }



  receiveCall() {
    if (this.incomingCall) {
      if (!this.isInCall) {
        this.handleIncomingCall(this.rtcSession!);
        this.ua!.currentSession = this.rtcSession!
        this.isInCall = true
      }
    }
    this.incomingCall = false;
  }


  hangUpCall() {
    console.log("hanging up call")
    if (this.incomingCall) {
      if (!this.isInCall) {
        this.rtcSession?.terminate()
      }
    }
    this.incomingCall = false;
  }

  setContacts(contacts: any) {
    this.contacts = contacts
  }


  endCall() {
    if (!this.notifiedEndCall) {
      // AsteriskChannelManager.endCall(this.authID!, this.calledExtension!)
    }
    if (this.isInCall) {
      console.log("Ending Call")
      this.rtcSession?.terminate()
      this.localMediaStream = undefined
      this.combinedStream = undefined
    }
    this.isVideoCall = false
    this.calledExtension = null
    this.combinedStream = undefined
    if (this.authID && this.authPassword) {
      // this.ua?.stop()
      // this._makeRegistration(this.authID, this.authPassword)

    }
    console.log("Ended Call", this.formattedTime)
    this.isInCall = false
    this.notifiedEndCall = false
    this.incomingCall = false;
    this.muted = false
    this.receivingCall = false
    this.makingCall = false
    // this.userToCall = undefined
    this.incomingCallerEndpoint = undefined

    setTimeout(() => {
      this.canMakeNextCall = true
    }, 10000);


  }



  private _makeRegistration(authID: string, authPassword: string) {
    console.log('Making new account registration');
    // let socket = new WebSocketInterface('wss://' + HOSTIPORNAME + '/ws');
    let socket = new WebSocketInterface('ws://' + HOSTIPORNAME + ':8088/ws');
    // let uri = 'sip:' + id + '@' + hostIpOrName;
    let uri = 'sip:' + authID + '@' + HOSTIPORNAME;

    let config: UAConfiguration = {
      sockets: [socket],
      uri: uri,

      // contact_uri: uri,

      // authorization_user: authName,
      authorization_user: authID,
      // username: authName,
      password: authPassword,
      register: this.register,
      register_expires: 300,
      realm: 'asterisk',
      session_timers: false
    };



    this.ua = new UA(config);

    this.ua.on('connected', (event) => {
      console.log(event.socket.url);
      event.socket.ondata = (event: any) => {
        // console.log(event);


      };
    });

    this.ua.on('sipEvent', (event) => {
      console.log("new Sip Event", event.request);
    });

    this.ua.on('newRTCSession', (data: IncomingRTCSessionEvent | OutgoingRTCSessionEvent) => {
      let rtc = data.session;
      switch (rtc.direction) {
        case 'incoming':
          this.rtcSession = rtc;
          // this.ua!.currentSession = rtc
          this.incomingCallerEndpoint = this.rtcSession._remote_identity._uri._user as string
          this.incomingCall = true;
          break;

        case 'outgoing':
          this.incomingCall = false;
          this.makingCall = true
          this.rtcSession = rtc
          this.handleOutgoingCall(rtc);
          this.ua!.currentSession = rtc
          break;
      }
    });


    this.ua.on('registered', () => {
      console.log('Registered to asterisk');
      this.isRegistered = true

    });

    this.ua.on('registrationFailed', (event) => {
      console.log('Failed to Register to asterisk', event.cause);
      console.log(event.response, this.ua!.status);
      // ua.register()
      let reg = this.ua!.registrator();
      reg.setExtraHeaders([]);
      // TODO: Linear retrying to reconnect and back off using sendAfter
    });

    this.ua.start();
    // ua = ua
  }

  private _makeCall(extension: string, videoCall: boolean = false) {
    this.isVideoCall = videoCall
    // @ts-ignore
    let eventHandlers: RTCSessionEventMap = {
      progress: (e: any) => {
        console.log('call is in progress', e);
      },
      failed: (e: any) => {
        console.log('call failed with cause: ', e);
        this.endCall()
      },
      ended: (e: any) => {
        console.log('call ended with cause: ', e);
        this.isInCall = false
        this.endCall()
      },
      confirmed: (e: any) => {
        console.log('call confirmed', e);
        this.isInCall = true
        // window.dispatchEvent(new CustomEvent("remote-media"))
        // AsteriskChannelManager.callInProgress(this.authID!, this.calledExtension!)
      }
    };

    var options = {
      eventHandlers: eventHandlers,
      // mediaConstraints: { audio: true, video: true },
      mediaConstraints: { audio: true, video: videoCall }
    };

    if (this.ua != undefined || (extension != '0' && extension.trim() != '')) {
      console.log('Making Call');
      this.ua!.call(`sip:${extension}@localhost`, options);


      // let streams = this.rtcSession.connection.getRemoteStreams()
      // console.log("Remote streams: from connection.getRemoteStreams", streams)
    }
  }


  private _formatTime(timeInSeconds: number): string {
    let hours = Math.floor(Math.floor(timeInSeconds) / (60 * 60));
    let minutes = Math.floor(Math.floor(timeInSeconds - hours * 60 * 60) / 60);
    let seconds = Math.floor(
      Math.floor(timeInSeconds - (hours * 60 * 60 + minutes * 60))
    );
    if (!(seconds < 60)) {
      seconds = 0;
    }
    if (!(minutes < 60)) {
      minutes = 0;
    }
    return `${this._toString(hours)}:${this._toString(minutes)}:${this._toString(seconds)}`;
  }

  private _toString(time: number): string {
    let timeString = time.toString();
    if (timeString.length == 1) {
      timeString = "0" + timeString;
    }
    return timeString;
  }
}


export class AsteriskSingleton {
  static asterisk_server: Asterisk | null = null

  static getAsteriskServer(): Asterisk {
    if (AsteriskSingleton.asterisk_server) {
      return AsteriskSingleton.asterisk_server
    }
    AsteriskSingleton.asterisk_server = new Asterisk()

    return AsteriskSingleton.asterisk_server

  }
}