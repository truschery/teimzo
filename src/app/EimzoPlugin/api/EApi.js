


export default class EApi {

    constructor() {
        this.url = this.getUrl()
        this.socket = null

        this._handlers = new Map()
        this.connect()
    }

    connect(){
        if (!window.WebSocket) return false

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

    send(data, success, fail) {
        if (!window.WebSocket) return fail && fail()

        // TODO: Need open new connection
        if(!this.socket) return fail && fail()

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            success && success(data)
        }

        this.socket.send(JSON.stringify(data))
    }




    api(data, success, fail){
        this.send(data, success, fail)
    }

    version(success, fail) {

        this.send({ name: 'version' }, success, fail)
    }

    apidoc(success, fail) {
        this.send({ name: 'apidoc' }, success, fail)
    }

    apikey(domainAndKey, success, fail) {
        this.send({ name: 'apikey', arguments: domainAndKey }, success, fail)
    }

    private getUrl() {
        const protocol = window.location.protocol.toLowerCase()
        const host = protocol === "https:" ? "wss://127.0.0.1:64443" : "ws://127.0.0.1:64646"

        return `${host}/service/cryptapi`
    }

}