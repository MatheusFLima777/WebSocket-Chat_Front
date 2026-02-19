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

            if (authenticated) {
                return getUser()
            }
        })
        .then(function (user) {
            if (user) {
                setText("user-name", user.name)
            }
        })
        .catch(function (error) {
            console.log("init failed:", error)
            setDisplay("auth-area", false)
            setDisplay("non-auth-area", true)
            setDisplay("checking-auth-area", false)
        })
}

function logJwt() {
    getJwt().then(function(jwt){
        console.log(jwt)
    })
}

function logTicket() {
    getJwt()
        .then(function(jwt){
            return getTicket(jwt)
        })
        .then(function(ticket){
            console.log(ticket)
        })
        .catch(function(err){
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
        .then(function(jwt){
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
        .catch(function(err){
            console.error("Erro ao conectar com ticket:", err)
        })
}

window.onload = function () {

    let loginButton = document.getElementById("login-button")
    let logoutButton = document.getElementById("logout-button")
    let getJwtButton = document.getElementById("get-jwt-button")
    let getTicketButton = document.getElementById("get-ticket-button")
    let connectWithoutTicketButton = document.getElementById("connect-without-ticket-button")
    let connectWithTicketButton = document.getElementById("connect-with-ticket-button")

    if (loginButton) loginButton.onclick = login
    if (logoutButton) logoutButton.onclick = logout
    if (getJwtButton) getJwtButton.onclick = logJwt
    if (getTicketButton) getTicketButton.onclick = logTicket
    if (connectWithoutTicketButton) connectWithoutTicketButton.onclick = connectWithoutTicket
    if (connectWithTicketButton) connectWithTicketButton.onclick = connectWithTicket

    init()
}
