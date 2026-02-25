let ws = null


let BACKEND_CONFIG = {
    restHost: "http://localhost:8080",
    wsHost: "ws://localhost:8080",
    pingInterval: 30000,
    pongTolerance: 90000
}


// ============================
// TICKET
// ============================

function log(...args) {
    if (DEBUG) {
        log(...args)
    }
}

function getTicket(token) {
    const options = {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token
        }
    }

    return fetch(BACKEND_CONFIG.restHost + "/v1/ticket", options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao obter ticket: " + response.status)
            }
            return response.json()
        })
        .then(response => response.ticket)
}


// ============================
// WEBSOCKET
// ============================

function connectWebSocket(onOpen, onClose, onMessage, autoReconnect) {

    let isOpen = ws && [WebSocket.CONNECTING, WebSocket.OPEN].includes(ws.readyState)
    if (isOpen) {
        return Promise.resolve()
    }

    let reconnect = function () {
        log("Reconectando em 3 segundos...")
        setTimeout(function () {
            connectWebSocket(onOpen, onClose, onMessage, autoReconnect)
                .catch(reconnect)
        }, 3000)
    }

    return getJwt()
        .then(jwt => getTicket(jwt))
        .then(ticket => {

            let pingInterval = null
            let lastPong = null

            ws = new WebSocket(BACKEND_CONFIG.wsHost + "/chat?ticket=" + ticket)

            ws.onopen = function (event) {
                log("WebSocket conectado")

                pingInterval = setInterval(function () {
                    if (lastPong && (Date.now() - lastPong) > BACKEND_CONFIG.pongTolerance) {
                        clearInterval(pingInterval)
                        ws.close()
                    } else {
                        ws.send("Ping")
                    }
                }, BACKEND_CONFIG.pingInterval)

                onOpen(event)
            }

            ws.onclose = function (event) {
                log("WebSocket fechado")
                clearInterval(pingInterval)
                onClose(event)

                if (autoReconnect) {
                    reconnect()
                }
            }

            ws.onmessage = function (event) {
                if (event.data === "Pong") {
                    lastPong = Date.now()
                } else {
                    onMessage(event)
                }
            }

            ws.onerror = function (error) {
                console.error("Erro no WebSocket:", error)
            }

        })
        .catch(function (error) {
            console.error("Erro ao conectar WebSocket:", error)
            if (autoReconnect) {
                reconnect()
            }
        })
}


// ============================
// ENVIO DE EVENTOS
// ============================

function sendEvent(chatUserId, text) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("WebSocket não está conectado.")
        return
    }

    let messagePayload = {
        to: chatUserId,
        text: text
    }

    ws.send(JSON.stringify(messagePayload))
}