// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// Bring in Phoenix channels client library:
import { Socket } from "phoenix"

// And connect to the path in "lib/vendor_web/endpoint.ex". We pass the
// token for authentication.
//
// Read the [`Using Token Authentication`](https://hexdocs.pm/phoenix/channels.html#using-token-authentication)
// section to see how the token should be used.
// let socket = new Socket("/socket", {authToken: window.userToken})
//
let socket = new Socket("ws://localhost:5000/socket", {
  params: {}
})
// occidentally-scapose-jimmie.ngrok-free.dev
// let socket = new Socket("wss://192.168.120.23:4443/socket", {
//   params: {}
// })

// let socket = new Socket("wss://occidentally-scapose-jimmie.ngrok-free.dev/socket", {
//   params: {}
// })

socket.connect()

let WhipChannel = socket.channel("whip", {})
WhipChannel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default WhipChannel