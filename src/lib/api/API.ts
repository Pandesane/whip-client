
export default class API {
  apiURL: string

  constructor(baseURL: string) {
    if (baseURL.endsWith("/")) {
      throw Error("Base URL must not end with /")
    }
    this.apiURL = baseURL
  }



  async list(): Promise<any> {
    let response = await fetch(this.apiURL, {

      headers: {
        "authentication": "pande-sane",
      }
    })

    let json = await response.json()
    return json.data

  }

  async get(slug: string | number): Promise<any> {
    let response = await fetch(`${this.apiURL}/${slug}`, {

    })

    let json = await response.json()
    return json.data

  }

  async create(mapData: any) {
    let response = await this.action(mapData, "POST")
    return response

  }


  async update(id: number | string, mapData: any) {
    return this.action(mapData, "PUT", `${this.apiURL}/${id}`)

  }


  async delete(id: string | number, mapData: any = {}) {
    let json = JSON.stringify({ ...mapData, id: id })
    console.log(json)
    let response = await fetch(`${this.apiURL}/${id}`, {
      method: "DELETE", body: json,
      headers: {
        "Content-Type": "application/json",
      }
    })

    let responseJson = await response.json()
    return responseJson.data
  }

  async action(data: any, method: string, url?: string): Promise<any> {
    let json = JSON.stringify(data)
    let response = await fetch(url ?? this.apiURL, {
      method: method, body: json,

      headers: {
        "Content-Type": "application/json",
      }
    })

    let result = await response.json()
    return result.data;
  }

  async getFetch(url: string, data?: any) {
    let json = JSON.stringify(data)

    let response = await fetch(url ?? this.apiURL, {
      method: "GET", body: json,

      headers: {
        "Content-Type": "application/json",
      }
    })

    let result = await response.json()
    return result.data;
  }


}