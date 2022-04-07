import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, Box, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TabContext, TabList, TabPanel } from "@mui/lab";

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
