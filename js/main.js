let loginButton = document.getElementById("login-button")
let logoutButton = document.getElementById("logout-button")
let connectButton = document.getElementById("connect-button")
let chatUsersSelect = document.getElementById("chat-users-select")
let chatMessageInput = document.getElementById("chat-message-input")
let sendButton = document.getElementById("send-button")
let chatMessagesDiv = document.getElementById("chat-messages-div")

if (loginButton) loginButton.onclick = login
if (logoutButton) logoutButton.onclick = logout
if (getJwtButton) getJwtButton.onclick = logJwt
if (getTicketButton) getTicketButton.onclick = logTicket
if (connectWithoutTicketButton) connectWithoutTicketButton.onclick = connectWithoutTicket
if (connectWithTicketButton) connectWithTicketButton.onclick = connectWithTicket


//Valida se é um redirecionamento da auth0

function init() {
    handleRedirectCallback()
        .then(function () { return isAuthenticated() })
        .then(function (authenticated) {
            if (authenticated) {
                window.history.replaceState({}, document.title, "/")
                setDisplay("auth-area", authenticated)
                setDisplay("non-auth-area", !authenticated)
                setDisplay("checking-auth-area", false)
                return authenticated && getUser()
            }


        })
        .then(function (user) {
            if (user) setText("user-name", user.name)
        })
        .catch(function (error) {
            console.log("init failed:", error)
            setDisplay("auth-area", false)
            setDisplay("non-auth-area", true)
            setDisplay("checking-auth-area", false)
        })
}


function onChatUsersWereUpdated(chatUsers) {
    console.log("Chat users:", chatUsers)
    clearSelect(chatUsersSelect)
    forEach(chatUsers, function (user) {
       addSelectOption(chatUsersSelect, user.name, user.id)
    })
}

//Funcao executada quando o WebSocket receber uma mensagem do servidor
function onOpen(event){
    console.log("WebSocket opened:", event)
}

function onClose(event){
    console.log("WebSocket closed:", event)

}

function onMessage(event){
    console.log("WebSocket message received:", event)
    let eventHandlers = {
        CHAT_USERS_WERE_UPDATED: onChatUsersWereUpdated,
        CHAT_MESSAGE_WAS_CREATED: onChatMessageWasCreated
    }
    let eventData = JSON.parse(event.data)
    let eventHandler = eventHandlers[eventData.type]
    if (eventHandler) eventHandler(eventData.payload)
}

//Define os callbacks 
function connect(){
    connectWebSocket(onOpen, onClose, onMessage, true).chat(console.log)
}


//Obtem o usuário destino a partir do select, o texto da mensagem a 
// partir do input e envia o evento de criação de mensagem para o servidor
function send(){
    let chatUserId = chatUsersSelect.value
    let text = chatMessageInput.value
    sendEvent(chatUserId, text)
    chatMessageInput.value = ""
}

//Permite enviar a mensagem ao pressionar a tecla Enter
function onKeyUp(event){
    if(event.key === "Enter"){
        send()
    }
}

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



function logJwt() {
    getJwt().then(function (jwt) {
        console.log(jwt)
    })
}

function logTicket() {
    getJwt()
        .then(function (jwt) {
            return getTicket(jwt)
        })
        .then(function (ticket) {
            console.log(ticket)
        })
        .catch(function (err) {
            console.error("Erro ao obter ticket:", err)
        })
}

function connectWithoutTicket() {
    let ws = new WebSocket("ws://localhost:8080/chat")

    ws.onopen = function () {
        console.log('Conexão WebSocket abriu')
    }

    ws.onclose = function () {
        console.log('Conexão WebSocket fechou')
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
                console.log('Conexão WebSocket abriu')
            }

            ws.onclose = function () {
                console.log('Conexão WebSocket fechou')
            }

            ws.onerror = function (err) {
                console.error("Erro no WebSocket:", err)
            }
        })
        .catch(function (err) {
            console.error("Erro ao conectar com ticket:", err)
        })
}

