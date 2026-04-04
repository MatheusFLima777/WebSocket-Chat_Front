
// ----------------------------------------------------------------------------
// CONFIGURAÇÃO AUTH0
// ----------------------------------------------------------------------------
let AUTH0_CONFIG = {
    domain: "dev-wbvjopv68bizr1w7.us.auth0.com",
    clientId: "ztYuVbonuLWnGFFoGJWcFTt6198jUTn6",
    cacheLocation: "localstorage",
    useRefreshTokens: true
}

// ----------------------------------------------------------------------------
// CLIENT
// ----------------------------------------------------------------------------
function getAuth0Client() {
    if (!window.auth0) {
        console.error("Auth0 NÃO carregou!");
        return Promise.reject("Auth0 não disponível");
    }

    if (window.auth0Client) return Promise.resolve(window.auth0Client);

    return window.auth0
        .createAuth0Client({
            ...AUTH0_CONFIG,
            authorizationParams: {
                redirect_uri: window.location.origin + "/chat.html"
            }
        })
        .then(function (client) {
            window.auth0Client = client;
            return client;
        });
}

// ----------------------------------------------------------------------------
// LOGIN
// ----------------------------------------------------------------------------
function login() {
    return getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.loginWithRedirect();
        });
}

// ----------------------------------------------------------------------------
// LOGOUT
// ----------------------------------------------------------------------------
function logout() {
    getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin + "/chat.html"
                }
            });
        })
        .catch(function (error) {
            console.error("logout failed:", error);
        });
}

// ----------------------------------------------------------------------------
// CALLBACK
// ----------------------------------------------------------------------------
function handleRedirectCallback() {
    const query = window.location.search;
    const isRedirect = query.includes("code=") && query.includes("state=");

    if (!isRedirect) return Promise.resolve();

    return getAuth0Client()
        .then(auth0Client => auth0Client.handleRedirectCallback())
        .then(() => {
            console.log("✅ Callback processado");
        });
}

// ----------------------------------------------------------------------------
// USER
// ----------------------------------------------------------------------------
function getUser() {
    return getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.getUser();
        });
}

// ----------------------------------------------------------------------------
// AUTH STATUS
// ----------------------------------------------------------------------------
function isAuthenticated() {
    return getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.isAuthenticated();
        });
}

// ----------------------------------------------------------------------------
// JWT
// ----------------------------------------------------------------------------
function getJwt() {
    return getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.getIdTokenClaims();
        })
        .then(function (claims) {
            return claims.__raw;
        });
}
