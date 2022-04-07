import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./popup.css";
import "./components/Signin/signin.css";
import Header from "../sharedComponents/header/header";
import parser from "hexagon-shared/utils/parser";
import { useComponentState } from "hexagon-frontend/src/utils/hooks";
import SigninPage from "./components/Signin/SigninPage";
import PopupBody from "./components/PopupBody/PopupBody";

type PopupState = {
    isLoggedIn: boolean;
};

type PopupProps = {
    isLoggedIn: boolean;
    username?: string;
    currentUrl?: string;
};

const Popup = (props: PopupProps) => {
    const { state, update } = useComponentState({
        isLoggedIn: props.isLoggedIn,
    });

    return (
        <div>
            <Header url={"icon.png"} clickAction={() => window.close()} />
            {props.isLoggedIn ? (
                <PopupBody name={props.username} url={props.currentUrl} />
            ) : (
                <SigninPage />
            )}
        </div>
    );
};

const root = document.createElement("div");
document.body.appendChild(root);

chrome.storage.local.get(["hexagonAccount"], function (account) {
    {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (result) {
                let currentUrl;
                try {
                    currentUrl = parser.extractDomain(result[0].url);
                } catch {
                    currentUrl = null;
                }
                ReactDOM.render(
                    <Popup
                        isLoggedIn={account.hexagonAccount ? true : false}
                        currentUrl={currentUrl}
                        username={
                            account.hexagonAccount
                                ? account.hexagonAccount.username
                                : ""
                        }
                    />,
                    root
                );
            }
        );
    }
});
