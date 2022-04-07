import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import parser from "hexagon-shared/utils/parser";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountService from "../../services/AccountService";
import { updateAccount } from "../../store/slices/AccountSlice";
import { clearNextLocation } from "../../store/slices/LocationSlice";
import { sendToast } from "../../store/slices/ToastSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useComponentState } from "../../utils/hooks";
import PasswordField from "../shared/PasswordField";
import styles from "./AuthForm.module.scss";

type AuthFormState = {
    isSignUp: boolean;
    isEmailEntered: boolean;
    showPassword: boolean;
    currentEmail: string;
    currentPassword: string;
    isInputValid: boolean;
    isLoading: boolean;
    isShown: boolean;
    invalidInputText?: string;
};

const accountService = new AccountService();

const onEmailSubmit = async (
    state: AuthFormState,
    update: (update: Partial<AuthFormState>) => void,
    dispatch: any
) => {
    if (!state.isInputValid || !state.currentEmail) {
        return update({
            invalidInputText: "Please enter a valid email",
            isInputValid: false,
        });
    }
    update({ isLoading: true });
    try {
        const { inUse } = (await accountService.checkInUse(
            state.currentEmail
        )) as { inUse: boolean };
        update({ isEmailEntered: true, isSignUp: !inUse });
    } catch (error: any) {
        dispatch(
            sendToast({
                message:
                    "Something went wrong and we were unable to verify your information. Please try again later.",
                severity: "error",
            })
        );
    }
    update({ isLoading: false });
};

const onEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    update: (update: Partial<AuthFormState>) => void
) => {
    const value = event.target.value.toLowerCase();
    const isInputValid = parser.isEmail(value);
    update({
        currentEmail: value.trim(),
        invalidInputText: "",
        isInputValid,
    });
};

const onBackButtonClick = (
    update: (update: Partial<AuthFormState>) => void
) => {
    update({
        isEmailEntered: false,
        currentPassword: "",
        showPassword: false,
        isInputValid: true,
        invalidInputText: "",
    });
};

const onPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    update: (update: Partial<AuthFormState>) => void
) => {
    const value = event.target.value;
    update({
        currentPassword: value,
        isInputValid: value.length > 0,
        invalidInputText: "",
    });
};

const onPasswordSubmit = async (
    state: AuthFormState,
    update: (update: Partial<AuthFormState>) => void,
    dispatch: any,
    navigate: any,
    location: string
) => {
    if (!state.currentPassword) {
        return update({
            invalidInputText: "Please enter a password",
            isInputValid: false,
        });
    }
    update({ isLoading: true });
    try {
        const { masterKey, jwt } = await accountService.authenticateUser(
            state.currentEmail,
            state.currentPassword,
            state.isSignUp
        );
        dispatch(
            updateAccount({
                email: state.currentEmail,
                masterKey,
                jwt,
            })
        );

        //send message to chrome extension here
        const hexagonExtensionId = "cpionbifpgemolinhilabicjppibdhck";

        try {
            chrome.runtime.sendMessage(hexagonExtensionId, {
                sentFrom: "Hexagon",
                user: {
                    username: state.currentEmail,
                    password: state.currentPassword,
                },
            });
        } catch {
            console.log("extension not installed");
        }

        window.localStorage.setItem("lastUser", state.currentEmail);

        dispatch(
            sendToast({
                message: `Welcome to Hexagon, ${state.currentEmail}`,
                severity: "success",
            })
        );
        update({ isShown: false });
        setTimeout(() => {
            navigate(location ? location : "/");
            dispatch(clearNextLocation());
        }, 500);
    } catch (error: any) {
        if (error.status === 401) {
            update({
                invalidInputText: "Invalid username or password",
                isInputValid: false,
            });
        } else {
            dispatch(
                sendToast({
                    message:
                        "Something went wrong and we were unable to authenticate. Please try again later.",
                    severity: "error",
                })
            );
        }
    }
    update({ isLoading: false });
};

export default function AuthForm() {
    const { state, update } = useComponentState({
        isSignUp: false,
        isEmailEntered: false,
        showPassword: false,
        currentEmail: "",
        currentPassword: "",
        isLoading: false,
        isInputValid: true,
        isShown: true,
    } as AuthFormState);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useAppSelector((state) => state.location);
    const bodyRef: React.RefObject<HTMLDivElement> = useRef(null);
    useEffect(() => {
        const lastUser = window.localStorage.getItem("lastUser");
        if (lastUser)
            update({
                currentEmail: lastUser,
                isEmailEntered: true,
                isSignUp: false,
            });
    }, []);

    const input = !state.isEmailEntered ? (
        <TextField
            fullWidth
            id="email"
            error={!state.isInputValid}
            label="Email"
            value={state.currentEmail}
            type="text"
            helperText={state.invalidInputText ?? ""}
            variant="standard"
            onChange={(e: any) => onEmailChange(e, update)}
        />
    ) : (
        <PasswordField
            isError={!state.isInputValid}
            password={state.currentPassword}
            onPasswordChange={(e: any) => onPasswordChange(e, update)}
            errorMessage={state.invalidInputText}
        />
    );

    return (
        <Grow in={state.isShown} timeout={500}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.logo}></div>
                    <div className={styles.title}>HEXAGON</div>
                </div>
                <div className={styles.body} ref={bodyRef}>
                    <Slide
                        direction="down"
                        in={state.isEmailEntered}
                        container={bodyRef.current}
                        unmountOnExit
                    >
                        <div className={styles["username-greeting"]}>
                            Welcome,{" "}
                            <span className={styles["current-email"]}>
                                {state.currentEmail}
                            </span>
                            .
                        </div>
                    </Slide>
                    <div className={styles.prompt}>
                        {state.isEmailEntered
                            ? "Enter your master password to continue."
                            : "Enter your email to begin."}
                    </div>
                    {input}
                </div>
                <div className={styles.footer}>
                    <Box sx={{ position: "relative" }}>
                        <Button
                            variant="contained"
                            onClick={
                                state.isEmailEntered
                                    ? () =>
                                          onPasswordSubmit(
                                              state,
                                              update,
                                              dispatch,
                                              navigate,
                                              location
                                          )
                                    : () =>
                                          onEmailSubmit(state, update, dispatch)
                            }
                            disabled={state.isLoading}
                        >
                            {state.isEmailEntered
                                ? state.isSignUp
                                    ? "Sign Up"
                                    : "Sign In"
                                : "Continue"}
                        </Button>
                        {state.isLoading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    marginTop: "-12px",
                                    marginLeft: "-12px",
                                }}
                            />
                        )}
                    </Box>
                    <Slide
                        direction="up"
                        in={state.isEmailEntered}
                        container={bodyRef.current}
                        unmountOnExit
                    >
                        <Button
                            variant="text"
                            startIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                            onClick={useCallback(
                                () => onBackButtonClick(update),
                                []
                            )}
                        >
                            Use different email
                        </Button>
                    </Slide>
                </div>
            </div>
        </Grow>
    );
}
