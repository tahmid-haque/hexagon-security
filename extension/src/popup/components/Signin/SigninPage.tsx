import { Button } from "@mui/material";
import React from "react";
import "../../popup.css";
import "./signin.css";

/**
 * Guide user to website signin page when the click the button.
 */
const onClickSignin = () => {
    chrome.tabs.create({
        active: true,
        url: "https://hexagon-web.xyz/authenticate",
    });
};

/**
 * The signin page for when the user is not yet logged in to an account.
 * @returns a react component
 */
const SigninPage = () => {
    return (
        <div className="signin-page">
            <div className="signin-dialog">
                <div className="signin-message">You are not logged in</div>
                <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={onClickSignin}
                >
                    Sign In
                </Button>
            </div>
        </div>
    );
};

export default SigninPage;
