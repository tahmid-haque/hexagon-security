import React, { SyntheticEvent, useState } from "react";
import {
    Card,
    Box,
    Button,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    TextField,
    IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Header from "../../sharedComponents/header/Header";
import { Credential } from "../contentScript";
import "./overlay.css";

/**
 * On submit of the autofill form, call the parameter function autofill with
 * the username and password details.
 * @param e
 * @param autofill
 * @param password
 */
const autofillFormSubmit = (
    e: SyntheticEvent,
    autofill: (uname: string, pass: string) => void,
    password: string
) => {
    e.preventDefault();
    let form = document.querySelector(
        "#hexagon-autofill-login-form"
    ) as HTMLFormElement;
    if (form.reportValidity()) {
        let account = document.querySelector(
            "#hexagon-autofill-username"
        ) as HTMLSelectElement;
        autofill(account.innerHTML, password);
    }
};

//properties of autofill overlay
type AutofillProps = {
    autofill: (uname: string, pass: string) => void;
    closeOverlay: () => void;
    accounts: Credential[];
};

/**
 * Autofill overlay that gets displayed when user is on a site that has save credentials
 * @param props
 * @returns a react component
 */
const AutofillOverlay = (props: AutofillProps) => {
    const [password, setPassword] = React.useState("");

    const handleChange = (event) => {
        setPassword(event.target.value);
    };

    return (
        <div className="hexagon-overlay">
            <Header
                url={chrome.runtime.getURL("icon.png")}
                clickAction={props.closeOverlay}
            />
            <Card className="hexagon-overlay-body">
                <div>Username/Password fields detected. Autofill fields?</div>

                <Box component={"form"} id="hexagon-autofill-login-form">
                    <div>
                        <FormControl required sx={{ mt: 2, width: 180 }}>
                            <InputLabel id="demo-simple-select-helper-label">
                                Account
                            </InputLabel>
                            <Select
                                id="hexagon-autofill-username"
                                required
                                value={password}
                                label="account"
                                onChange={handleChange}
                                MenuProps={{
                                    style: { zIndex: 100005 },
                                }}
                            >
                                {props.accounts.map((account) => (
                                    <MenuItem
                                        key={account.id}
                                        value={account.password}
                                    >
                                        {account.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <Button
                        size="large"
                        onClick={(e) =>
                            autofillFormSubmit(e, props.autofill, password)
                        }
                        sx={{ margin: "5px", fontSize: "15px" }}
                    >
                        Autofill
                    </Button>
                </Box>
            </Card>
        </div>
    );
};

/**
 * On submit of the save form, the parameter function saveCredentials is called with the
 * username, password, and website details.
 * @param e
 * @param saveCredentials
 * @param saveUrl
 */
const saveFormSubmit = (
    e: SyntheticEvent,
    saveCredentials: (username: string, password: string, url: string) => void,
    saveUrl: string
) => {
    e.preventDefault();
    let form = document.querySelector(
        "#hexagon-save-login-form"
    ) as HTMLFormElement;
    if (form.reportValidity()) {
        let username = document.querySelector(
            "#hexagon-save-username"
        ) as HTMLInputElement;
        let password = document.querySelector(
            "#hexagon-save-password"
        ) as HTMLInputElement;
        saveCredentials(username.value, password.value, saveUrl);
    }
};

//properties of the save overlay
type SaveProps = {
    username: string;
    password: string;
    closeOverlay: () => void;
    saveCredentials: (username: string, password: string, url: string) => void;
    saveURL: string;
};

/**
 * The save form overlay that is displayed when a new credential is detected on login.
 * @param props
 * @returns a react component
 */
const SavePassOverlay = (props: SaveProps) => {
    const [showPass, setShowPass] = useState(false);

    const icon = (
        <IconButton
            sx={{ m: 0 }}
            onClick={() => setShowPass((showPass) => !showPass)}
        >
            <VisibilityIcon fontSize="small" />
        </IconButton>
    );

    return (
        <div className="hexagon-overlay hexagon-save-overlay">
            <Header
                url={chrome.runtime.getURL("icon.png")}
                clickAction={props.closeOverlay}
            />
            <Card className="hexagon-overlay-body hexagon-save-overlay-body">
                <div>
                    Username/Password detected. Save username and password?
                </div>

                <Box component={"form"} id="hexagon-save-login-form">
                    <TextField
                        required
                        id="hexagon-save-username"
                        label="Username"
                        defaultValue={props.username}
                        sx={{ mt: 3, mb: 2, width: "240px" }}
                    />

                    {showPass ? (
                        <TextField
                            required
                            id="hexagon-save-password"
                            label="Password"
                            defaultValue={props.password}
                            InputProps={{
                                endAdornment: icon,
                            }}
                            sx={{ m: 1, width: "240px" }}
                        />
                    ) : (
                        <TextField
                            required
                            id="hexagon-save-password"
                            label="Password"
                            type="password"
                            defaultValue={props.password}
                            InputProps={{
                                endAdornment: icon,
                            }}
                            sx={{ m: 1, width: "240px" }}
                        />
                    )}

                    <Button
                        onClick={(e) =>
                            saveFormSubmit(
                                e,
                                props.saveCredentials,
                                props.saveURL
                            )
                        }
                        size="large"
                        sx={{ margin: "5px", fontSize: "15px" }}
                    >
                        Save
                    </Button>
                </Box>
            </Card>
        </div>
    );
};

//properties of the siginin overlay
type SigninProps = {
    email: string;
    closeOverlay: () => void;
    onAccept: () => void;
    onDecline: () => void;
};

/**
 * The signin overlay that is displayed when the background script detects login to
 * a new Hexagon account.
 * @param props
 * @returns a react component
 */
const SigninOverlay = (props: SigninProps) => {
    return (
        <div className="hexagon-overlay hexagon-signin-overlay">
            <Header
                url={chrome.runtime.getURL("icon.png")}
                clickAction={props.closeOverlay}
            />
            <Card className="hexagon-overlay-body hexagon-signin-body">
                <div>
                    Sign-in to Hexagon detected. Log in to extension as{" "}
                    {props.email}?
                </div>
                <Box
                    display="flex"
                    justifyContent={"space-between"}
                    m={2}
                    width="80%"
                >
                    <Button
                        variant="outlined"
                        size="large"
                        sx={{ margin: "5px", fontSize: "15px" }}
                        onClick={props.onDecline}
                    >
                        No
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ margin: "5px", fontSize: "15px" }}
                        onClick={props.onAccept}
                    >
                        Yes
                    </Button>
                </Box>
            </Card>
        </div>
    );
};

export { AutofillOverlay, SavePassOverlay, SigninOverlay };
