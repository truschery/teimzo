


export default class EApi {

    constructor() {
        this.url = this.getUrl()
        this.socket = null

        this._handlers = new Map()
        this.connect()
    }

    connect(){
        if (!window?.WebSocket) return false

        this.socket = new WebSocket(this.url)

        this.socket.onclose = (e) => {
            if(e.code !== 1000){

                //Todo create on Close Error
            }
        }

        // this.socket.onmessage = (e) => {
        //     const data = JSON.parse(e.data)
        // }

        // this.socket.onopen = function(){
        //     this.socket.send(JSON.stringify(funcDef))
        // }
    }

    send(data) {
        return new Promise((resolve, reject) => {
            if(!this.socket) return reject("Websocket doesn't exist")

            this.socket.addEventListener('message', event => {
                const data = JSON.parse(event.data)

                resolve(data)
            })

            this.socket.send(JSON.stringify(data))
        })
    }




    api(data){
        return this.send(data)
    }

    version() {
        return this.send({ name: 'version' })
    }

    apidoc() {
        return this.send({ name: 'apidoc' })
    }

    apikey(domainAndKey) {
        return this.send({ name: 'apikey', arguments: domainAndKey })
    }

    getUrl() {
        const protocol = window.location.protocol.toLowerCase()
        const host = protocol === "https:" ? "wss://127.0.0.1:64443" : "ws://127.0.0.1:64646"

        return `${host}/service/cryptapi`
    }

}