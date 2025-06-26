


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

        // this.socket.onopen = function(){
        //     this.socket.send(JSON.stringify(funcDef))
        // }
    }

    on(name, callback) {
        if(!name || !callback) return false

        this._handlers.set(name, callback)
    }

    sendV2(data){
        return new Promise((resolve, reject) => {

            if (!this.socket) return reject('Socket not connected')

            this.socket.addEventListener('message', event => {
                const data = JSON.parse(event.data)

                resolve(data)
            })

            if(this.socket.readyState === WebSocket.OPEN){
                return this.socket.send(JSON.stringify(data))
            }

            this.socket.onopen = () => {
                return this.socket.send(JSON.stringify(data))
            }

        })

    }

    send(data, success, fail) {
        if (!window.WebSocket) return fail && fail()

        const socket = new WebSocket(this.url)

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            success && success(data)
        }

        socket.onclose = (e) => {
            if(e.code !== 1000){
                fail && fail(e.reason)
            }
        }

        if(socket.readyState === WebSocket.OPEN){
            return socket.send(JSON.stringify(data))
        }

        socket.onopen = () => {
            socket.send(JSON.stringify(data))
        }
    }


    api(data){
        return this.sendV2(data)
    }

    version() {
        return this.sendV2({ name: 'version' })
    }

    apidoc(success, fail) {
        this.send({ name: 'apidoc' }, success, fail)
    }

    apikey(domainAndKey, success, fail) {
        return this.sendV2({ name: 'apikey', arguments: domainAndKey })
    }

    getUrl() {
        const protocol = window.location.protocol.toLowerCase()
        const host = protocol === "https:" ? "wss://127.0.0.1:64443" : "ws://127.0.0.1:64646"

        return `${host}/service/cryptapi`
    }

}