import CloseIcon from "@mui/icons-material/Close";
import { Box, Card, IconButton, TextField } from "@mui/material";
import React from "react";

/**
 * Display for messages in the extension popup.
 * @param param0
 * @returns a react component
 */
const PopupMessage = ({
    message,
    onClose,
}: {
    message: string;
    onClose: () => void;
}) => {
    const icon = (
        <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
        </IconButton>
    );

    return (
        <Box
            position={"absolute"}
            bottom={"10px"}
            width="330px"
            mx={"10px"}
            zIndex="99999"
        >
            <Card
                sx={{
                    backgroundColor: "#bbdefb",
                    paddingX: "5px",
                    paddingY: "2px",
                }}
            >
                <TextField
                    defaultValue={message}
                    InputProps={{
                        readOnly: true,
                        disableUnderline: true,
                        endAdornment: icon,
                    }}
                    variant="standard"
                    sx={{ width: "100%" }}
                />
            </Card>
        </Box>
    );
};

/**
 * Display for an error message in the extension popup.
 * @param param0
 * @returns a react component
 */
const ErrorMessage = ({
    message,
    onClose,
}: {
    message: string;
    onClose: () => void;
}) => {
    const icon = (
        <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
        </IconButton>
    );

    return (
        <Box
            position={"absolute"}
            bottom={"10px"}
            width="330px"
            mx={"10px"}
            zIndex="99999"
        >
            <Card
                sx={{
                    backgroundColor: "#ffccbc",
                    paddingX: "5px",
                    paddingY: "2px",
                }}
            >
                <TextField
                    defaultValue={message}
                    InputProps={{
                        readOnly: true,
                        disableUnderline: true,
                        endAdornment: icon,
                    }}
                    variant="standard"
                    sx={{ width: "100%" }}
                />
            </Card>
        </Box>
    );
};

export { PopupMessage, ErrorMessage };
