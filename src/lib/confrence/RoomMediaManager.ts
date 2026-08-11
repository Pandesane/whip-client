export class RoomMediaManager {
  remoteMediaElement: HTMLDivElement


  constructor(remoteMediaElement: HTMLDivElement) {
    this.remoteMediaElement = remoteMediaElement
  }


  attachMediaElement(mediaElement: HTMLMediaElement, isVideo: boolean = false) {

    mediaElement.controls = isVideo
    this.remoteMediaElement.appendChild(mediaElement)

  }

  addMediaStream(mediaStream: MediaStream, onlyAudio: boolean = false) {
    if (onlyAudio) {
      let audioElement = document.createElement("audio")
      audioElement.srcObject = mediaStream
      audioElement.autoplay = true

      this.remoteMediaElement.appendChild(audioElement)
    } else {
      let videoElement = document.createElement("video")
      videoElement.autoplay = true
      videoElement.srcObject = mediaStream
      this.remoteMediaElement.appendChild(videoElement)
    }
  }
}