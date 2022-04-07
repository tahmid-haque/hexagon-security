import React, { useState, useEffect, SyntheticEvent } from "react";
import {
    Card,
    Box,
    Button,
    Typography,
    Tab,
    TextField,
    IconButton,
} from "@mui/material";
import "../../popup.css";
import "../Signin/signin.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import parser from "hexagon-shared/utils/parser";
import { mfaAPI } from "../../../utils/mfaAPI";
import {
    PopupMessage,
    ErrorMessage,
} from "../../../sharedComponents/PopupMessages/PopupMessage";

const MFAKeyForm = ({ url }: { url: string }) => {
    const [showSecret, setShowSecret] = useState(false);
    const [showError, setShowError] = useState(false);
    const [secretHelperText, setSecretHelperText] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureMessage, setFailureMessage] = useState("");

    const icon = (
        <IconButton onClick={() => setShowSecret((showSecret) => !showSecret)}>
            <VisibilityIcon fontSize="small" />
        </IconButton>
    );

    const onFormSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        let website = document.querySelector(
            "#mfa-website"
        ) as HTMLInputElement;
        let username = document.querySelector(
            "#mfa-username"
        ) as HTMLInputElement;
        let secret = document.querySelector("#mfa-secret") as HTMLInputElement;
        if (!parser.isBase32(secret.value)) {
            setShowError(true);
            setSecretHelperText("Secret must be base 32");
            return;
        }
        await createMFA(username.value, secret.value);
        let form = document.querySelector("#add-mfa-form") as HTMLFormElement;
        form.reset();
    };

    const createMFA = async (username: string, seed: string) => {
        chrome.storage.local.get(["hexagonAccount"], async function (result) {
            if (result.hexagonAccount) {
                try {
                    await mfaAPI.createMFA(
                        {
                            email: result.hexagonAccount.email,
                            masterKey: result.hexagonAccount.key,
                            jwt: result.hexagonAccount.token,
                        },
                        url,
                        username,
                        seed
                    );
                    setShowSuccess(true);
                } catch (err) {
                    setFailureMessage(err);
                    setShowFailure(true);
                }
            }
        });
    };

    return (
        <div>
            <Box
                id="add-mfa-form"
                display={"flex"}
                flexDirection={"column"}
                padding={3}
                component={"form"}
                onSubmit={onFormSubmit}
            >
                <div className="hexagon-mfa-subheading">
                    Create MFA Credential
                </div>

                <TextField
                    id="mfa-website"
                    required
                    label="URL"
                    defaultValue={url}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    sx={{ mb: "5px" }}
                    disabled
                />
                <TextField
                    id="mfa-username"
                    required
                    label="Username/Email"
                    variant="standard"
                    sx={{ mb: "5px" }}
                />
                {showSecret ? (
                    <TextField
                        error={showError}
                        id="mfa-secret"
                        required
                        label="Secret"
                        autoComplete="current-password"
                        variant="standard"
                        sx={{ mb: 4 }}
                        InputProps={{
                            endAdornment: icon,
                        }}
                        helperText={secretHelperText}
                        onChange={(e) => {
                            setShowError(false);
                            setSecretHelperText("");
                        }}
                    />
                ) : (
                    <TextField
                        error={showError}
                        id="mfa-secret"
                        required
                        label="Secret"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: icon,
                        }}
                        helperText={secretHelperText}
                        onChange={(e) => {
                            setShowError(false);
                            setSecretHelperText("");
                        }}
                    />
                )}
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ width: "150px", marginLeft: "auto" }}
                >
                    Submit
                </Button>
            </Box>
            {showSuccess && (
                <PopupMessage
                    message="MFA key successfully created."
                    onClose={() => setShowSuccess(false)}
                />
            )}
            {showFailure && (
                <ErrorMessage
                    message={failureMessage}
                    onClose={() => setShowFailure(false)}
                />
            )}
        </div>
    );
};

export default MFAKeyForm;
