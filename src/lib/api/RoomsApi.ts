
import API from "./API"

class RoomsApi extends API {

  constructor() {
    super("http://localhost:4020/api/rooms")
  }

  async getRoom(slug: string): Promise<any> {
    return await super.get(slug)

  }


}
const RoomsAPI = new RoomsApi()

export default RoomsAPI

