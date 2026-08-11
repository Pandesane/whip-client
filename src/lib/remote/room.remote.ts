import { query } from "$app/server";
import RoomsAPI from "$lib/api/RoomsApi";
import type { IRoom } from "$lib/interface/IRoom";






export const getActiveRooms = query(async () => {
  let rooms: IRoom[] = await RoomsAPI.list()
  console.log("Rooms Response", rooms)
  return rooms
})