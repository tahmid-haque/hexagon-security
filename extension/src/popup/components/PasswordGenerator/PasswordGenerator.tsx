import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReplayIcon from "@mui/icons-material/Replay";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import React, { useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import "../../popup.css";
import "../Signin/signin.css";

/**
 * Chooses random characters in an array to generate a password.
 * @returns a randomly generated password
 */
const generatePass = (): string => {
    const characters =
        "aAbBcCdDeEfFgGhHiIj!@#$%^&*()_+=-{}[]JkKlLmMnNoOpPqQrRsStTuUvVwWXyYzZ123456790~`|;:<>,.?/'";
    let length = characters.length;
    let password = "";
    for (let i = 0; i < 16; i++) {
        let index = Math.floor(Math.random() * length);
        password += characters[index];
    }

    return password;
};

/**
 * The password generator.
 * @returns a react component
 */
const Generator = () => {
    const [pass, setPass] = useState(generatePass());

    const regenerateIcon = (
        <IconButton
            sx={{ m: 0 }}
            onClick={() => setPass((pass) => (pass = generatePass()))}
        >
            <ReplayIcon fontSize="small" />
        </IconButton>
    );

    return (
        <Box p={3} pb={0} className="hexagon-generator">
            <div className="hexagon-subheading">Generate A Password</div>
            <Tooltip arrow title="Double click to copy" placement="top">
                <TextField
                    id="outlined-read-only-input"
                    label="Password"
                    value={pass}
                    InputProps={{
                        readOnly: true,
                        endAdornment: regenerateIcon,
                    }}
                    onDoubleClick={() => navigator.clipboard.writeText(pass)}
                    sx={{ mb: 2 }}
                />
            </Tooltip>

            <PasswordStrengthBar password={pass} />
        </Box>
    );
};

/**
 * Password strength checker for checking user inputted passwords.
 * @returns a react component
 */
const StrengthChecker = () => {
    const [checkPass, setCheckPass] = useState("");

    const copyIcon = (
        <IconButton
            sx={{ m: 0 }}
            onClick={() => navigator.clipboard.writeText(checkPass)}
        >
            <ContentCopyIcon fontSize="small" />
        </IconButton>
    );

    return (
        <Box px={3} py={1} className="hexagon-check-strength">
            <div className="hexagon-subheading">Check Password Strength</div>
            <Tooltip arrow title="Double click to copy" placement="top">
                <TextField
                    id="outlined-helperText"
                    label="Enter Password"
                    value={checkPass}
                    InputProps={{
                        endAdornment: copyIcon,
                    }}
                    onChange={(e) =>
                        setCheckPass(
                            (checkPass) => (checkPass = e.target.value)
                        )
                    }
                    onDoubleClick={() =>
                        navigator.clipboard.writeText(checkPass)
                    }
                    sx={{ mb: 2 }}
                />
            </Tooltip>

            <PasswordStrengthBar password={checkPass} />
        </Box>
    );
};

const PasswordGenerator = () => {
    return (
        <div>
            <Generator />
            <StrengthChecker />
        </div>
    );
};

export default PasswordGenerator;
