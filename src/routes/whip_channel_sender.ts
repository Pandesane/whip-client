import WhipChannel from '$lib/sockets/whip_channel'
import zlFetch from 'zl-fetch'

export class WHIPClientTSChannel {

  iceUsername: string | null
  icePassword: string | null
  pc: RTCPeerConnection | null
  token: string | null = null
  candidates: RTCIceCandidate[]
  endOfcandidates = false
  iceTrickeTimeout: number | null = null
  restartIce: null | Date = null
  resourceURL: URL | null = null
  etag: string | null = null
  onOffer: (offerSDP?: string) => string | undefined
  onAnswer: (offerSDP?: string) => string | undefined
  constructor() {
    //Ice properties
    this.iceUsername = null;
    this.icePassword = null;
    this.pc = null

    //Pending candidadtes
    this.candidates = [];

    // @ts-ignore
    this.onOffer = (offer) => offer;
    // @ts-ignore
    this.onAnswer = (answer) => answer;
  }

  // @ts-ignore
  async publish(pc: RTCPeerConnection, url: string, token: string) {
    //If already publishing
    if (this.pc) throw new Error('Already publishing');

    //Store pc object and token
    this.token = token;
    this.pc = pc;

    //Listen for state change events
    // @ts-ignore
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
        //Ignore candidates not from the first m line
        //Skip
        // if (event.candidate.sdpMLineIndex && event.candidate.sdpMLineIndex > 0)
        //   return;
        //Store candidate
        console.log(event.candidate.sdpMLineIndex, event.candidate)
        this.candidates.push(event.candidate);
        WhipChannel.push("candidate", {candidate: event.candidate.candidate})
      } else {
        //No more candidates
        this.endOfcandidates = true;
      }
      //Schedule patch on next tick if there is no already a timer or doing restart
      if (!this.iceTrickeTimeout && !this.restartIce) {
        this.iceTrickeTimeout = 0
        // this.patch()
      }
      this.patch()
    };
    //Create SDP offer
    const offer = await pc.createOffer();
    offer.sdp = this.onOffer(offer.sdp);
    WhipChannel.push("sdp", { sdp: offer.sdp })
    await pc.setLocalDescription(offer);
    WhipChannel.on("answer", async (answer) => {
      console.log(answer)
      await pc.setRemoteDescription({ type: "answer", sdp: answer.answer });
      WhipChannel.push("send-candidates", { candidates: this.candidates })
      WhipChannel.push("patch", { headers: "headers", body: "fragment" })
    })




  }

  async restart() {
    //Clear any pendint timeout
    this.iceTrickeTimeout = null
    clearTimeout(this.iceTrickeTimeout!);

    //Clean candidates and end of candidates flag as new ones will be retrieved
    this.candidates = [];
    this.endOfcandidates = false;

    //Restart ice
    this.pc!.restartIce();
    //Create a new offer
    const offer = await this.pc!.createOffer({ iceRestart: true });
    //Update ice
    this.iceUsername = offer.sdp!.match(/a=ice-ufrag:(.*)\r\n/)![1];
    this.icePassword = offer.sdp!.match(/a=ice-pwd:(.*)\r\n/)![1];
    //Set it
    await this.pc!.setLocalDescription(offer);

    //Set restart flag time
    this.restartIce = new Date();

    //Clear any pendint timeout
    clearTimeout(this.iceTrickeTimeout || 0);
    this.iceTrickeTimeout = 0

    //patch
    return this.patch();
  }

  async patch() {
    //Clear any pendint timeout


    //Get data
    const candidates = this.candidates;
    const endOfcandidates = this.endOfcandidates;
    const restartIce = this.restartIce;

    //Clean pending data before async operation
    console.log(candidates, this.candidates)
    // this.candidates = [];
    this.endOfcandidates = false;

    //Prepare fragment
    let fragment =
      'a=ice-ufrag:' + this.iceUsername + '\r\n' + 'a=ice-pwd:' + this.icePassword + '\r\n';
    //Get peerconnection transceivers
    const transceivers = this.pc!.getTransceivers();
    console.log(transceivers)
    //Get medias
    interface IMedia {
      mid: string;
      kind: string;
      candidates: RTCIceCandidate[];
    }
    const medias: Record<string, IMedia> = {};
    //If doing something else than a restart
    if (candidates.length || endOfcandidates)
      //Create media object for first media always
      medias[transceivers[0].mid!] = {
        mid: transceivers[0].mid!,
        kind: transceivers[0].receiver.track.kind,
        candidates: []
      };
    //For each candidate
    for (const candidate of candidates) {
      //Get mid for candidate
      const mid = candidate.sdpMid;
      //Get associated transceiver
      const transceiver = transceivers.find((t) => t.mid === mid);
      //Get media
      let media = medias[mid!];
      //If not found yet
      if (!media)
        //Create media object
        media = medias[mid!] = {
          mid: mid!,
          kind: transceiver!.receiver.track.kind,
          candidates: []
        };
      //Add candidate
      media.candidates.push(candidate);
    }
    //For each media
    for (const media of Object.values(medias)) {
      //Add media to fragment
      // @ts-ingnore
      fragment += 'm=' + media!.kind + ' 9 UDP/TLS/RTP/SAVPF 0\r\n' + 'a=mid:' + media.mid + '\r\n';
      //Add candidate
      for (const candidate of media.candidates) fragment += 'a=' + candidate.candidate + '\r\n';
      if (endOfcandidates) fragment += 'a=end-of-candidates\r\n';
    }

    //Request headers
    const headers = {
      'Content-Type': 'application/trickle-ice-sdpfrag'
    };

    //If doing an ice restart
    if (restartIce)
      //Set if match to any
      // @ts-ignore
      headers['If-Match'] = '*';
    else if (this.etag)
      //Set if match to last known etag
      // @ts-ignore
      headers['If-Match'] = this.etag;

    //If token is set
    if (this.token)
      // @ts-ignore
      headers['Authorization'] = 'Bearer ' + this.token;


    //Do the post request to the WHIP resource
    console.log(headers, fragment)

    WhipChannel.push("patch", { headers: headers, body: fragment })


  }

  // @ts-ignore
  async mute(muted) {
    //Request headers
    const headers = {
      'Content-Type': 'application/json'
    };

    //If token is set
    if (this.token)
      // @ts-ignore
      headers['Authorization'] = 'Bearer ' + this.token;

    //Do the post request to the WHIP resource
    // @ts-ignore
    const fetched = await fetch(this.resourceURL, {
      method: 'POST',
      body: JSON.stringify(muted),
      headers
    });
  }

  async stop() {
    if (!this.pc) {
      // Already stopped
      return;
    }

    //Cancel any pending timeout
    this.iceTrickeTimeout = 0
    clearTimeout(this.iceTrickeTimeout);

    //Close peerconnection
    this.pc.close();

    //Null
    this.pc = null;

    //If we don't have the resource url
    if (!this.resourceURL) throw new Error('WHIP resource url not available yet');

    //Request headers
    const headers = {};

    //If token is set
    // if (this.token) headers['Authorization'] = 'Bearer ' + this.token;

    //Send a delete
    await fetch(this.resourceURL, {
      method: 'DELETE',
      headers
    });
  }
}
