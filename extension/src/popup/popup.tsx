import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Box, LinearProgress } from "@mui/material";
import "./popup.css";
import "./components/Signin/signin.css";
import Header from "../sharedComponents/header/Header";
import parser from "hexagon-shared/utils/parser";
import { useComponentState } from "hexagon-frontend/src/utils/hooks";
import SigninPage from "./components/Signin/SigninPage";
import PopupBody from "./components/PopupBody/PopupBody";
import { authenticationAPI } from "../utils/authenticationAPI";

export type HexagonAccount = {
    username: string;
    email: string;
    password: string;
    token: string;
    masterKey: string;
};

const HexagonAccount = ({ url }: { url: string }) => {
    const [credentials, setCredentials] = useState<HexagonAccount>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        chrome.storage.local.get(["hexagonAccount"], async function (result) {
            // console.log(result.hexagonAccount);
            if (result.hexagonAccount) {
                setCredentials({
                    username: result.hexagonAccount.username,
                    email: result.hexagonAccount.email,
                    password: result.hexagonAccount.password,
                    token: result.hexagonAccount.token,
                    masterKey: result.hexagonAccount.key,
                });
                setIsLoggedIn(true);
            } else setIsLoggedIn(false);
        });
    });

    return (
        <div>
            <Header url={"icon.png"} clickAction={() => window.close()} />
            {isLoggedIn == null && (
                <Box
                    sx={{
                        width: "350px",
                        height: "432px",
                        backgroundColor: "white",
                    }}
                >
                    <LinearProgress />
                </Box>
            )}
            {isLoggedIn === true && (
                <PopupBody account={credentials} url={url} />
            )}
            {isLoggedIn === false && <SigninPage />}
        </div>
    );
};

const root = document.createElement("div");
document.body.appendChild(root);

chrome.tabs.query({ currentWindow: true, active: true }, function (result) {
    let currentUrl;
    try {
        currentUrl = parser.extractDomain(result[0].url);
    } catch {
        currentUrl = null;
    }
    ReactDOM.render(<HexagonAccount url={currentUrl} />, root);
});
