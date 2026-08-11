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
// 192.168.120.23
let room_socket = new Socket("ws://localhost:4020/room_socket", {
  params: {}
})
// occidentally-scapose-jimmie.ngrok-free.dev
// let user_socket = new Socket("wss://192.168.120.23:4443/user_socket", {
//   params: {}
// })
// let user_socket = new Socket("wss://occidentally-scapose-jimmie.ngrok-free.dev/user_socket", {
//   params: {}
// })


room_socket.connect()

export  default room_socket


