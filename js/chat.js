window.onload = async () => {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        window.location.replace("index.html");
    }
};