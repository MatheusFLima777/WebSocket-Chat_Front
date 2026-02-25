// ============================
// ELEMENTOS DOM
// ============================

let loginButton = document.getElementById("login-button")
let logoutButton = document.getElementById("logout-button")
let connectButton = document.getElementById("connect-button")

let getJwtButton = document.getElementById("get-jwt-button")
let getTicketButton = document.getElementById("get-ticket-button")
let connectWithoutTicketButton = document.getElementById("connect-without-ticket-button")
let connectWithTicketButton = document.getElementById("connect-with-ticket-button")

let chatUsersSelect = document.getElementById("chat-users-select")
let chatMessageInput = document.getElementById("chat-message-input")
let sendButton = document.getElementById("send-button")
let chatMessagesDiv = document.getElementById("chat-messages-div")

const DEBUG = false


// ============================
// EVENTOS
// ============================

if (loginButton) loginButton.onclick = login
if (logoutButton) logoutButton.onclick = logout
if (connectButton) connectButton.onclick = connect

if (getJwtButton) getJwtButton.onclick = logJwt
if (getTicketButton) getTicketButton.onclick = logTicket
if (connectWithoutTicketButton) connectWithoutTicketButton.onclick = connectWithoutTicket
if (connectWithTicketButton) connectWithTicketButton.onclick = connectWithTicket

if (sendButton) sendButton.onclick = send
if (chatMessageInput) chatMessageInput.onkeyup = onKeyUp


function log(...args) {
    if (DEBUG) {
        log(...args)
    }
}

// ============================
// INICIALIZAÇÃO AUTH0
// ============================



function init() {
    handleRedirectCallback()
        .then(function () { return isAuthenticated() })
        .then(function (authenticated) {

            if (authenticated) {
                window.history.replaceState({}, document.title, "/")
            }

            setDisplay("auth-area", authenticated)
            setDisplay("non-auth-area", !authenticated)
            setDisplay("checking-auth-area", false)

            return authenticated && getUser()
        })
        .then(function (user) {

            log("USER:", user)
            if (user) setText("user-name", user.name)
        })
        .catch(function (error) {
            log("init failed:", error)
            setDisplay("auth-area", false)
            setDisplay("non-auth-area", true)
            setDisplay("checking-auth-area", false)
        })
}


// ============================
// WEBSOCKET
// ============================

function onOpen(event) {
    log("WebSocket opened:", event)
}

function onClose(event) {
    log("WebSocket closed:", event)
}

function onMessage(event) {
    log("WebSocket message received:", event)

    let eventHandlers = {
        CHAT_USERS_WERE_UPDATED: onChatUsersWereUpdated,
        CHAT_MESSAGE_WAS_CREATED: onChatMessageWasCreated
    }

    let eventData = JSON.parse(event.data)
    let eventHandler = eventHandlers[eventData.type]

    if (eventHandler) eventHandler(eventData.payload)
}

function connect() {
    connectWebSocket(onOpen, onClose, onMessage, true).catch(console.error)
}


// ============================
// CHAT
// ============================

function onChatUsersWereUpdated(chatUsers) {
    log("Chat users:", chatUsers)

    clearSelect(chatUsersSelect)

    chatUsers.forEach(function (user) {
        addSelectOption(chatUsersSelect, user.name, user.id)
    })
}

function onChatMessageWasCreated(chatMessage) {
    log("Nova mensagem:", chatMessage)

    if (!chatMessagesDiv) return

    let messageElement = document.createElement("div")
    messageElement.innerText =
        chatMessage.from.name + ": " + chatMessage.text

    chatMessagesDiv.appendChild(messageElement)
}

function send() {
    if (!chatUsersSelect || !chatMessageInput) return

    let chatUserId = chatUsersSelect.value
    let text = chatMessageInput.value

    if (!text.trim()) return

    sendEvent(chatUserId, text)
    chatMessageInput.value = ""
}

function onKeyUp(event) {
    if (event.key === "Enter") {
        send()
    }
}


// ============================
// UTILITÁRIOS
// ============================

function modify(className, modifier) {
    let elements = document.getElementsByClassName(className)

    for (let i = 0; i < elements.length; i++) {
        modifier(elements[i])
    }
}

function setDisplay(className, show) {
    modify(className, function (element) {
        element.style.display = show ? "block" : "none"
    })
}

function setText(className, text) {
    modify(className, function (element) {
        element.innerText = text
    })
}
function clearSelect(selectElement) {
    if (!selectElement) return
    selectElement.innerHTML = ""
}

function addSelectOption(selectElement, text, value) {
    if (!selectElement) return

    let option = document.createElement("option")
    option.text = text
    option.value = value

    selectElement.appendChild(option)
}


// ============================
// JWT / TICKET
// ============================

function logJwt() {
    getJwt()
        .then(function (jwt) {
            log(jwt)
        })
        .catch(console.error)
}

function logTicket() {
    getJwt()
        .then(function (jwt) {
            return getTicket(jwt)
        })
        .then(function (ticket) {
            log(ticket)
        })
        .catch(function (err) {
            console.error("Erro ao obter ticket:", err)
        })
}

function connectWithoutTicket() {
    let ws = new WebSocket("ws://localhost:8080/chat")

    ws.onopen = function () {
        log("Conexão WebSocket abriu")
    }

    ws.onclose = function () {
        log("Conexão WebSocket fechou")
    }

    ws.onerror = function (err) {
        console.error("Erro no WebSocket:", err)
    }
}

function connectWithTicket() {
    getJwt()
        .then(function (jwt) {
            return getTicket(jwt)
        })
        .then(function (ticket) {

            let ws = new WebSocket("ws://localhost:8080/chat?ticket=" + ticket)

            ws.onopen = function () {
                log("Conexão WebSocket abriu")
            }

            ws.onclose = function () {
                log("Conexão WebSocket fechou")
            }

            ws.onerror = function (err) {
                console.error("Erro no WebSocket:", err)
            }
        })
        .catch(function (err) {
            console.error("Erro ao conectar com ticket:", err)
        })
}

init()