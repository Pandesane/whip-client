

import WhipChannel from '$lib/sockets/whip_channel'

export class WHEPClientTSChannel {
  pc: RTCPeerConnection | null = null
  candidates: RTCIceCandidate[] = []
  constructor() {

  }

  // @ts-ignore
  async view(pc: RTCPeerConnection) {
    //If already publishing
    if (this.pc) throw new Error('Already publishing');
    this.pc = pc;

    //Listen for state change events
    pc.onconnectionstatechange = (event) => {
      switch (pc.connectionState) {
        case 'connected':
          // The connection has become fully connected
          break;
        case 'disconnected':
        case 'failed':
          // One or more transports has terminated unexpectedly or in an error
          break;
        case 'closed':
          // The connection has been closed
          break;
      }
    };

    //Listen for candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(event.candidate.sdpMLineIndex, event.candidate)
        this.candidates.push(event.candidate);
      }
    };
    const offer = await pc.createOffer();
    WhipChannel.push("whep-sdp", { sdp: offer.sdp })
    await pc.setLocalDescription(offer);
    WhipChannel.on("whep-answer", async (answer) => {
      console.log(answer)
      await pc.setRemoteDescription({ type: "answer", sdp: answer.answer });
      // WhipChannel.push("send-candidates", { candidates: this.candidates })
      // WhipChannel.push("patch", { headers: "headers", body: "fragment" })
    })

  }

}
