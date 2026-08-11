import RoomChannel from "../channels/room_channel";



export default class RoomChannelHelper {

  static joinRoom(room_name: string, user_name: string, onResponse: (token: string) => void) {
    RoomChannel.push("join-room", { room_name, user_name }).receive("ok", (response: any) => {
      console.log("Join room response: ", response)
      onResponse(response.token)

    })

  }


  static createRoom(room_name: string, user_name: string, onResponse: (token: string) => void) {
    RoomChannel.push("create-room", { user_name, room_name }).receive("ok", (response: any) => {
      console.log("Join room response: ", response.token)
      onResponse(response.token)
    })
  }
}