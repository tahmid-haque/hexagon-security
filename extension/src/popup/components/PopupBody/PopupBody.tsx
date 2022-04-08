import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Card, Tab } from "@mui/material";
import React, { useState } from "react";
import { ErrorMessage } from "../../../sharedComponents/PopupMessages/PopupMessage";
import { authenticationAPI } from "../../../utils/authenticationAPI";
import type { HexagonAccount } from "../../popup";
import "../../popup.css";
import MFAKeyForm from "../MFAKey/MFAKeys";
import PasswordGenerator from "../PasswordGenerator/PasswordGenerator";
import PopupPasswords from "../Passwords/Passwords";
import "../Signin/signin.css";

//properties of a user greeting
type UserGreetingProps = {
    name: string;
    onLogout: () => void;
};

/**
 * The greeting for the user at the top of the popup.
 * @param props
 * @returns a react component
 */
const UserGreeting = (props: UserGreetingProps) => {
    return (
        <div className="container">
            <Box mb={"2px"}>
                <Card>
                    <Box
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        <div className="greeting">Hello {props.name}...</div>
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{
                                px: "8px",
                                m: "10px",
                                height: "30px",
                                fontSize: 13,
                            }}
                            onClick={props.onLogout}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Card>
            </Box>
        </div>
    );
};

//properties of the popup body
type PopupBodyProps = {
    account: HexagonAccount;
    url: string;
};

/**
 * The entire popup body with tabs for passwords, generator, and mfa.
 * @param props
 * @returns a react component
 */
const PopupBody = (props: PopupBodyProps) => {
    const [value, setValue] = React.useState("1");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handles tab change
     * @param event
     * @param newValue
     */
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    /**
     * Calls the logout to sign the user out. Sets an error message on failure to logout.
     */
    const onLogout = async () => {
        try {
            await authenticationAPI.signOut(props.account.token);
            chrome.storage.local.clear();
        } catch (err) {
            setErrorMessage(err);
            setShowError(true);
        }
    };

    return (
        <div className="home-container">
            <UserGreeting name={props.account.username} onLogout={onLogout} />

            <Box sx={{ width: "100%", typography: "body1" }}>
                <TabContext value={value}>
                    <Box
                        sx={{ backgroundColor: "#f2f2f2", marginBottom: "0px" }}
                    >
                        <TabList
                            onChange={handleChange}
                            aria-label="chrome extension popup tabs"
                        >
                            <Tab label="Home" value="1" />
                            <Tab label="Generator" value="2" />
                            <Tab label="2FA Keys" value="3" />
                        </TabList>
                    </Box>
                    <TabPanel
                        value="1"
                        sx={{
                            height: "337px",
                            width: "100%",
                            typography: "body1",
                            padding: "0",
                        }}
                    >
                        <PopupPasswords url={props.url} />
                    </TabPanel>
                    <TabPanel value="2" sx={{ height: "337px", padding: "0" }}>
                        <PasswordGenerator />
                    </TabPanel>
                    <TabPanel value="3" sx={{ height: "337px", padding: "0" }}>
                        <MFAKeyForm url={props.url} />
                    </TabPanel>
                </TabContext>
                {showError && (
                    <ErrorMessage
                        message={errorMessage}
                        onClose={() => setShowError(false)}
                    />
                )}
            </Box>
        </div>
    );
};

export default PopupBody;
