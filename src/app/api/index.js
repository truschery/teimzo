
module.exports = function () {
    let socket = null

    function connect () {
        if (!window?.WebSocket) return false

        const url = getConnectUrl()
        socket = new WebSocket(url)

        socket.onclose = (e) => {
            if(e.code !== 1000){

                //Todo create on Close Error
            }
        }
    }

    function send(data){
        return new Promise((resolve, reject) => {
            if(!socket) return reject("Websocket doesn't exist")

            socket.addEventListener('message', event => {
                const data = JSON.parse(event.data)

                resolve(data)
            })

            if(socket.readyState === WebSocket.OPEN){
                socket.send(JSON.stringify(data))
            }

            socket.onopen = () => {
                socket.send(JSON.stringify(data))
            }
        })
    }

    function eimzo(data){
        return send(data)
    }
    function version() {
        return send({ name: 'version' })
    }

    function apidoc() {
        return send({ name: 'apidoc' })
    }

    function apikey(domainAndKey) {
        return send({ name: 'apikey', arguments: domainAndKey })
    }

    function getConnectUrl() {
        if(!window) return false

        const protocol = window.location.protocol.toLowerCase()
        const host = protocol === "https:" ? "wss://127.0.0.1:64443" : "ws://127.0.0.1:64646"

        return `${host}/service/cryptapi`
    }

    connect()

    return {
        eimzo,
        version,
        apidoc,
        apikey
    }
}