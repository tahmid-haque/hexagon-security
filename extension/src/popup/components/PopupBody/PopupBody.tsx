import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, Box, Button, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import "../../popup.css";
import "../Signin/signin.css";
import PopupPasswords from "../Passwords/Passwords";
import PasswordGenerator from "../PasswordGenerator/PasswordGenerator";
import MFAKeyForm from "../MFAKey/MFAKeys";
import { authenticationAPI } from "../../../utils/authenticationAPI";
import type { HexagonAccount } from "../../popup";
import {
    PopupMessage,
    ErrorMessage,
} from "../../../sharedComponents/PopupMessages/PopupMessage";

type UserGreetingProps = {
    name: string;
    onLogout: () => void;
};

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

type PopupBodyProps = {
    account: HexagonAccount;
    url: string;
};

const PopupBody = (props: PopupBodyProps) => {
    const [value, setValue] = React.useState("1");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

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
