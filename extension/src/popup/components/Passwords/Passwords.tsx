import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Avatar,
    Box,
    Button,
    Card,
    IconButton,
    LinearProgress,
    TextField,
    Typography,
} from "@mui/material";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { Credential } from "../../../contentScript/contentScript";
import { ErrorMessage } from "../../../sharedComponents/PopupMessages/PopupMessage";
import { credentialsAPI } from "../../../utils/credentialsAPI";
import "../../popup.css";
import "./passwords.css";

/**
 * Calls update function with username and password on update form submit.
 * @param e
 * @param username
 * @param password
 * @param onUpdate
 */
const onFormSubmit = async (
    e: SyntheticEvent,
    username: string,
    password,
    onUpdate: (username: string, password: string) => void
) => {
    e.preventDefault();
    await onUpdate(username, password);
};

//properties of the password form
type PasswordFormProps = {
    username: string;
    password: string;
    id: string;
    onUpdate: (username: string, password: string) => void;
};

/**
 * The password update for for each password card.
 * @param props
 * @returns a react component
 */
const PasswordCardForm = (props: PasswordFormProps) => {
    const [showPass, setShowPass] = useState(false);
    const [pass, setPass] = useState("");
    const icon = (
        <IconButton onClick={() => setShowPass((showPass) => !showPass)}>
            <VisibilityIcon fontSize="small" />
        </IconButton>
    );

    return (
        <Card
            sx={{
                borderTop: "solid 1.5px #3a5cb5",
                borderRadius: "0 0 2px 2px",
            }}
        >
            <Box
                id={"hexagon-update-pass-" + props.username}
                padding={2}
                pt={"8px"}
                display="flex"
                justifyContent={"space-between"}
                alignItems={"flex-end"}
                component={"form"}
                onSubmit={(e) =>
                    onFormSubmit(e, props.username, pass, props.onUpdate)
                }
            >
                {showPass ? (
                    <TextField
                        id={"hexagon-updated-password"}
                        required
                        label="Password"
                        autoComplete="current-password"
                        variant="standard"
                        defaultValue={pass}
                        onChange={(e) =>
                            setPass((pass) => (pass = e.target.value))
                        }
                        InputProps={{
                            endAdornment: icon,
                        }}
                    />
                ) : (
                    <TextField
                        id={"hexagon-updated-password"}
                        required
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                        defaultValue={pass}
                        onChange={(e) =>
                            setPass((pass) => (pass = e.target.value))
                        }
                        InputProps={{
                            endAdornment: icon,
                        }}
                    />
                )}
                <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    sx={{ height: "30px" }}
                >
                    Update
                </Button>
            </Box>
        </Card>
    );
};

//properties of a password card
type PasswordProps = {
    website: string;
    username: string;
    password: string;
    id: string;
    onDelete: () => void;
    onUpdate: (username: string, password: string) => void;
};

/**
 * The password card for each credential, displaying the website url, username and password.
 * @param props
 * @returns a react component
 */
const PasswordCard = (props: PasswordProps) => {
    const [showPass, setShowPass] = useState(false);
    const [showPassUpdateForm, setShowPassUpdateForm] = useState(false);

    return (
        <Box mb={"2px"}>
            <Card
                sx={{
                    display: "flex",
                    padding: "10px",
                    justifyContent: "space-between",
                }}
            >
                <div className="website-pass-container">
                    <div className="site-icon-container">
                        <Avatar
                            sx={{
                                bgcolor: "none",
                                width: "60px",
                                height: "60px",
                                objectFit: "contain",
                            }}
                            variant="rounded"
                            src={`https://logo.clearbit.com/${props.website}`}
                            alt={props.website.toUpperCase()}
                        ></Avatar>
                    </div>
                    <div className="site-info">
                        <Typography
                            variant="button"
                            sx={{ fontWeight: "bold" }}
                            display="block"
                        >
                            {props.website}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: "light", color: "#424242" }}
                            display="block"
                            onDoubleClick={() =>
                                navigator.clipboard.writeText(props.username)
                            }
                        >
                            {props.username}
                        </Typography>
                        <div className="pass-info">
                            {showPass ? (
                                <TextField
                                    value={props.password}
                                    InputProps={{
                                        readOnly: true,
                                        disableUnderline: true,
                                        style: {
                                            fontSize: 14,
                                            width: 100,
                                            marginRight: 5,
                                        },
                                    }}
                                    size="small"
                                    variant="standard"
                                    onDoubleClick={() =>
                                        navigator.clipboard.writeText(
                                            props.password
                                        )
                                    }
                                />
                            ) : (
                                <TextField
                                    value="••••••••••••••••••"
                                    InputProps={{
                                        readOnly: true,
                                        disableUnderline: true,
                                        style: {
                                            fontSize: 14,
                                            width: 100,
                                            marginRight: 5,
                                        },
                                    }}
                                    size="small"
                                    variant="standard"
                                    onDoubleClick={() =>
                                        navigator.clipboard.writeText(
                                            props.password
                                        )
                                    }
                                />
                            )}
                            <IconButton
                                onClick={() =>
                                    setShowPass((showPass) => !showPass)
                                }
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                </div>
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent="space-between"
                >
                    <IconButton
                        onClick={props.onDelete}
                        sx={{ height: 30, width: 30 }}
                    >
                        <DeleteOutlineIcon
                            color="error"
                            sx={{ fontSize: 24 }}
                        />
                    </IconButton>

                    <IconButton
                        onClick={() =>
                            setShowPassUpdateForm(
                                (showPassUpdateForm) => !showPassUpdateForm
                            )
                        }
                        sx={{ height: 30, width: 30 }}
                    >
                        <EditIcon color="disabled" sx={{ fontSize: 22 }} />
                    </IconButton>
                </Box>
            </Card>
            {showPassUpdateForm && (
                <PasswordCardForm
                    username={props.username}
                    password={props.password}
                    id={props.id}
                    onUpdate={props.onUpdate}
                />
            )}
        </Box>
    );
};

/**
 * The page to be displayed when a user has no passwords saved on the current site.
 * @param param0
 * @returns a react component
 */
const EmptyPasswordsPage = ({ url }: { url: string }) => {
    return (
        <Box
            className="hexagon-subheading hexagon-empty-passwords"
            m={"auto"}
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            py={4}
        >
            <Box display="flex" flexDirection="column" fontSize={18}>
                <div>No passwords for this site yet...</div>

                <Box
                    height={"175px"}
                    width={"175px"}
                    margin="auto"
                    marginTop={"15px"}
                >
                    <Avatar
                        sx={{
                            bgcolor: "none",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                        variant="rounded"
                        src={`https://logo.clearbit.com/${url}`}
                        alt={url.toUpperCase()}
                    ></Avatar>
                </Box>
            </Box>
        </Box>
    );
};

/**
 * The passwords page where the cards will be displayed for each credential.
 * @param param0
 * @returns a react component
 */
const PopupPasswords = ({ url }: { url: string }) => {
    const [passwords, setPasswords] = useState<Credential[] | null>(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPasswords(url);
    }, [url]);

    /**
     * Call the api and retrieve the saved credentials for the current site.
     * @param url
     */
    const fetchPasswords = async (url: string) => {
        chrome.storage.local.get(["hexagonAccount"], async function (result) {
            if (result.hexagonAccount) {
                try {
                    await credentialsAPI
                        .getWebsiteCredentials(
                            {
                                email: result.hexagonAccount.email,
                                masterKey: result.hexagonAccount.key,
                                jwt: result.hexagonAccount.token,
                            },
                            url
                        )
                        .then((credentials) => {
                            setPasswords(credentials);
                        });
                } catch (err) {
                    setErrorMessage(err);
                    setShowError(true);
                }
            }
        });
    };

    /**
     * Returns a function that calls the delete api to delete and refresh the credentials.
     * @param id
     * @returns a function that deletes credentials
     */
    const handleDelete = (id: string) => async () => {
        chrome.storage.local.get(["hexagonAccount"], async function (result) {
            if (result.hexagonAccount) {
                try {
                    await credentialsAPI.deleteCredential(
                        {
                            email: result.hexagonAccount.email,
                            masterKey: result.hexagonAccount.key,
                            jwt: result.hexagonAccount.token,
                        },
                        id
                    );
                    await fetchPasswords(url);
                } catch (err) {
                    setErrorMessage(err);
                    setShowError(true);
                }
            }
        });
    };

    /**
     * Returns a function that calls the update api to update and refresh the credentials.
     * @param id
     * @param key
     * @returns a function that updates credentials.
     */
    const handleUpdate =
        (id: string, key: string) =>
        async (username: string, password: string) => {
            chrome.storage.local.get(
                ["hexagonAccount"],
                async function (result) {
                    if (result.hexagonAccount) {
                        try {
                            await credentialsAPI.updateCredential(
                                {
                                    email: result.hexagonAccount.email,
                                    masterKey: result.hexagonAccount.key,
                                    jwt: result.hexagonAccount.token,
                                },
                                id,
                                url,
                                username,
                                password,
                                key
                            );
                            setPasswords(null);
                            await fetchPasswords(url);
                        } catch (err) {
                            setErrorMessage(err);
                            setShowError(true);
                        }
                    }
                }
            );
        };

    //display loading progress bar while credentials are being retrieved
    if (!passwords) {
        return (
            <Box sx={{ width: "100%" }} margin="-2px">
                <LinearProgress />
            </Box>
        );
    }

    return (
        <div>
            {passwords.length == 0 ? (
                <EmptyPasswordsPage url={url} />
            ) : (
                passwords.map((password) => (
                    <PasswordCard
                        website={password.url}
                        username={password.username}
                        password={password.password}
                        key={password.id}
                        id={password.id}
                        onDelete={handleDelete(password.id)}
                        onUpdate={handleUpdate(password.id, password.key)}
                    />
                ))
            )}
            {showError && (
                <ErrorMessage
                    message={errorMessage}
                    onClose={() => setShowError(false)}
                />
            )}
        </div>
    );
};

export default PopupPasswords;
