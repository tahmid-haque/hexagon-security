import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, IconButton, TextField } from "@mui/material";
import parser from "hexagon-shared/utils/parser";
import React, { SyntheticEvent, useState } from "react";
import {
    ErrorMessage,
    PopupMessage,
} from "../../../sharedComponents/PopupMessages/PopupMessage";
import { mfaAPI } from "../../../utils/mfaAPI";
import "../../popup.css";
import "../Signin/signin.css";

/**
 * The MFA code creation form.
 * @param param0
 * @returns a react component
 */
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

    /**
     * Validate input of form on submit and call method to create an MFA.
     * @param e
     */
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

    /**
     * Call the api to create an MFA. Sets success message after creation or error message on errors.
     * @param username
     * @param seed
     */
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
