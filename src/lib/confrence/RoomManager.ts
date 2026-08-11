import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackType,
  VideoPresets
} from 'livekit-client';
import type { RoomMediaManager } from './RoomMediaManager';

// creates a new room with options
export class RoomManager {
  url: string = 'ws://localhost:7880';
  token: string;
  room: Room
  localMediaStream: MediaStream | undefined = undefined
  roomMediaManager: RoomMediaManager
  constructor(token: string, roomMediaManager: RoomMediaManager) {
    this.roomMediaManager = roomMediaManager
    console.log("Remote media element", this.roomMediaManager)

    // connect to room
    this.room = new Room({
      // automatically manage subscribed video quality
      adaptiveStream: true,

      // optimize publishing bandwidth and CPU for published tracks
      dynacast: true,

      // default capture settings
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution
      }
    });

    this.room
      .on(RoomEvent.TrackSubscribed, (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.handleTrackSubscribed(track, publication, participant, this)

      })
      .on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, this.handleActiveSpeakerChange)
      .on(RoomEvent.Disconnected, this.handleDisconnect)
      .on(RoomEvent.Connected, () => this.handleConnected(this))
      .on(RoomEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished)
      .on(RoomEvent.ParticipantConnected, this.handleParticipantConnected)


    this.token = token
    this.room.prepareConnection(this.url, token);
  }


  async connectToRoom() {
    await this.room.connect(this.url, this.token);
    console.log('connected to room', this.room.name);

    // publish local camera and mic tracks
    await this.room.localParticipant.enableCameraAndMicrophone();
    this.getMyStreams()
  }

  leaveRoom() {
    this.room.disconnect(true)
  }

  getMyStreams() {
    this.localMediaStream = new MediaStream()
    this.room.localParticipant.trackPublications.values().forEach((ltp) => {
      if (ltp.kind == Track.Kind.Video) {
        console.log(ltp.videoTrack)
        this.localMediaStream?.addTrack(ltp.videoTrack?.mediaStreamTrack!)

      } else if (ltp.kind == Track.Kind.Audio) {
        console.log(ltp.audioTrack)
        this.localMediaStream?.addTrack(ltp.audioTrack?.mediaStreamTrack!)

      }

    })
  }

  // get your url from livekit's dashboard, or point it at a self hosted livekit deployment

  // generate a token by making a request to a endpoint using the livekit server sdk or
  // using a prebuilt TokenSource (documented below)
  // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODYyNzIwNDQsImlhdCI6MTc4NjI3MTQ0NCwiaXNzIjoiZGV2a2V5IiwibmJmIjoxNzg2MjcxNDM5LCJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZX19.xiP9XzeYlKL3J4zcY17Et9rByq-NhpasYE-ZnUJ2F44';

  // pre-warm connection, this can be called as early as your page is loaded

  // set up event listeners

  handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant, thisState: RoomManager
  ) {
    if (track.kind === Track.Kind.Video) {
      // attach it to a new HTMLVideoElement or HTMLAudioElement
      const element = track.attach();
      thisState.roomMediaManager.attachMediaElement(element, true)
    } else if (track.kind === Track.Kind.Audio) {
      const element = track.attach();
      thisState.roomMediaManager.attachMediaElement(element)
    }

    // let mediaStream = new MediaStream()
    // let onlyAudio = true
    // participant.trackPublications.values().forEach((rtp) => {
    //   if (rtp.kind == Track.Kind.Video) {
    //     onlyAudio = false
    //     if (rtp.audioTrack?.mediaStreamTrack != undefined)
    //       mediaStream.addTrack(rtp.videoTrack?.mediaStreamTrack!)

    //   } else if (rtp.kind == Track.Kind.Audio) {
    //     console.log(rtp.audioTrack?.mediaStreamTrack!)
    //     if (rtp.audioTrack?.mediaStreamTrack != undefined)
    //       mediaStream.addTrack(rtp.audioTrack?.mediaStreamTrack!)

    //   }

    // })
    // thisState.roomMediaManager.addMediaStream(mediaStream)
    // console.log(mediaStream)
  }

  handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    // remove tracks from all attached elements
    track.detach();
  }

  handleLocalTrackUnpublished(
    publication: LocalTrackPublication,
    participant: LocalParticipant
  ) {
    // when local tracks are ended, update UI to remove them from rendering
    publication.track?.detach();
  }

  handleActiveSpeakerChange(speakers: Participant[]) {
    // show UI indicators when participant is speaking
  }

  handleConnected(thisState: RoomManager) {
    console.log(thisState.room)
    if (thisState.room.remoteParticipants != undefined) {
      thisState.room.remoteParticipants.values().forEach((remoteParticipant) => {
        let mediaStream = new MediaStream()
        let onlyAudio = true
        remoteParticipant.trackPublications.values().forEach((rtp) => {
          if (rtp.kind == Track.Kind.Video) {
            onlyAudio = false
            if (rtp.audioTrack?.mediaStreamTrack != undefined)
              mediaStream.addTrack(rtp.videoTrack?.mediaStreamTrack!)

          } else if (rtp.kind == Track.Kind.Audio) {
            console.log(rtp.audioTrack?.mediaStreamTrack!)
            if (rtp.audioTrack?.mediaStreamTrack != undefined)
              mediaStream.addTrack(rtp.audioTrack?.mediaStreamTrack!)

          }

        })
        // thisState.roomMediaManager.addMediaStream(mediaStream)
        console.log(mediaStream)
      })
    }
  }

  handleDisconnect() {
    console.log('disconnected from room');
  }


  handleParticipantConnected(remoteParticipant: RemoteParticipant) {
    console.log(remoteParticipant)

  }
}