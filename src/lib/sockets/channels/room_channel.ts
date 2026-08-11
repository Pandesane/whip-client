import  room_socket from "../room_socket"
room_socket.connect()

let RoomChannel = room_socket.channel("room", {})
RoomChannel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default RoomChannel