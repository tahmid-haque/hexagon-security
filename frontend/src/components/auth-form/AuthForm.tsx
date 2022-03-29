import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountService from '../../services/AccountService';
import { updateAccount } from '../../store/slices/AccountSlice';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch } from '../../store/store';
import PasswordField from '../shared/PasswordField';
import styles from './AuthForm.module.scss';

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

export default function AuthForm() {
    let [state, setState] = useState({
        isSignUp: false,
        isEmailEntered: false,
        showPassword: false,
        currentEmail: '',
        currentPassword: '',
        isLoading: false,
        isInputValid: true,
        isShown: true,
    } as AuthFormState);
    const navigate = useNavigate();
    const appDispatch = useAppDispatch();

    const update = (update: Partial<AuthFormState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };
    const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // taken from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
        const emailMatcher =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const value = event.target.value;
        const isInputValid = emailMatcher.test(value.toLowerCase());
        update({
            currentEmail: value,
            invalidInputText: '',
            isInputValid,
        });
    };

    const onEmailSubmit = async (
        _event: React.MouseEvent<HTMLButtonElement>
    ) => {
        if (!state.isInputValid || !state.currentEmail) {
            return update({
                invalidInputText: 'Please enter a valid email',
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
            appDispatch(
                sendToast({
                    message:
                        'Something went wrong and we were unable to verify your information. Please try again later.',
                    severity: 'error',
                })
            );
        }
        update({ isLoading: false });
    };

    const onBackButtonClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
        update({
            isEmailEntered: false,
            currentPassword: '',
            showPassword: false,
            isInputValid: true,
            invalidInputText: '',
        });
    };

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        update({
            currentPassword: value,
            isInputValid: value.length > 0,
            invalidInputText: '',
        });
    };

    const welcomeUser = (masterKey: string, jwt: string) => {
        appDispatch(
            updateAccount({
                email: state.currentEmail,
                masterKey,
                jwt,
            })
        );

        //send message to chrome extension here

        appDispatch(
            sendToast({
                message: `Welcome to Hexagon, ${state.currentEmail}`,
                severity: 'success',
            })
        );
        update({ isShown: false });
        setTimeout(() => navigate('/'), 500);
    };

    const onPasswordSubmit = async (
        _event: React.MouseEvent<HTMLButtonElement>
    ) => {
        if (!state.currentPassword) {
            return update({
                invalidInputText: 'Please enter a password',
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
            welcomeUser(masterKey, jwt);
        } catch (error: any) {
            if (JSON.parse(error.message).status) {
                update({
                    invalidInputText: 'Invalid username or password',
                    isInputValid: false,
                });
            } else {
                appDispatch(
                    sendToast({
                        message:
                            'Something went wrong and we were unable to authenticate. Please try again later.',
                        severity: 'error',
                    })
                );
            }
        }
        update({ isLoading: false });
    };

    const bodyRef: React.RefObject<HTMLDivElement> = useRef(null);

    const input = !state.isEmailEntered ? (
        <TextField
            fullWidth
            id='email'
            error={!state.isInputValid}
            label='Email'
            value={state.currentEmail}
            type='email'
            helperText={state.invalidInputText ?? ''}
            variant='standard'
            onChange={onEmailChange}
        />
    ) : (
        <PasswordField
            isError={!state.isInputValid}
            password={state.currentPassword}
            onPasswordChange={onPasswordChange}
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
                        direction='down'
                        in={state.isEmailEntered}
                        container={bodyRef.current}
                        unmountOnExit
                    >
                        <div className={styles['username-greeting']}>
                            Welcome,{' '}
                            <span className={styles['current-email']}>
                                {state.currentEmail}
                            </span>
                            .
                        </div>
                    </Slide>
                    <div className={styles.prompt}>
                        {state.isEmailEntered
                            ? 'Enter your master password to continue.'
                            : 'Enter your email to begin.'}
                    </div>
                    {input}
                </div>
                <div className={styles.footer}>
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            variant='contained'
                            onClick={
                                state.isEmailEntered
                                    ? onPasswordSubmit
                                    : onEmailSubmit
                            }
                            disabled={state.isLoading}
                        >
                            {state.isEmailEntered
                                ? state.isSignUp
                                    ? 'Sign Up'
                                    : 'Sign In'
                                : 'Continue'}
                        </Button>
                        {state.isLoading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                    <Slide
                        direction='up'
                        in={state.isEmailEntered}
                        container={bodyRef.current}
                        unmountOnExit
                    >
                        <Button
                            variant='text'
                            startIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                            onClick={onBackButtonClick}
                        >
                            Use different email
                        </Button>
                    </Slide>
                </div>
            </div>
        </Grow>
    );
}
