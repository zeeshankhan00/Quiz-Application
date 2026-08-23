import { useEffect } from "react";

function OAuth2Redirect({ onLoginSuccess }) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("jwt", token);
            onLoginSuccess(); // tell App.jsx to move to the topic-selection stage
        } else {
            // no token means login failed or was tampered with
            window.location.href = "/"; // send back to a safe starting point
        }
    }, [onLoginSuccess]);

    return <p>Signing you in...</p>;
}

export default OAuth2Redirect;