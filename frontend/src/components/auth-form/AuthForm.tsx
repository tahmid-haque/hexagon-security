import { useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Slide from '@mui/material/Slide';
import './AuthForm.scss';
import AccountService from '../../services/AccountService';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch } from '../../store/store';

type AuthFormState = {
    isSignUp: boolean;
    isEmailEntered: boolean;
    showPassword: boolean;
    currentEmail: string;
    currentPassword: string;
    isInputValid: boolean;
    invalidInputText?: string;
};

const accountService = new AccountService();

export default function AuthForm() {
    const [state, setState] = useState({
        isSignUp: false,
        isEmailEntered: false,
        showPassword: false,
        currentEmail: '',
        currentPassword: '',
        isInputValid: true,
    } as AuthFormState);
    const appDispatch = useAppDispatch();

    const update = (update: any) => setState({ ...state, ...update });

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

    const onEmailSubmit = (_event: React.MouseEvent<HTMLButtonElement>) => {
        if (!state.isInputValid || !state.currentEmail) {
            return update({
                invalidInputText: 'Please enter a valid email',
                isInputValid: false,
            });
        }
        accountService
            .checkInUse(state.currentEmail)
            .then((res) => {
                update({ isEmailEntered: true, isSignUp: !res.inUse });
            })
            .catch(() => {
                appDispatch(
                    sendToast({
                        message:
                            'Something went wrong and we were unable to verify your information. Please try again later.',
                        severity: 'error',
                    })
                );
            });
    };

    const onBackButtonClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
        update({
            isEmailEntered: false,
            currentPassword: '',
            showPassword: false,
        });
    };

    const onTogglePasswordViewClick = (
        _event: React.MouseEvent<HTMLButtonElement>
    ) => {
        update({ showPassword: !state.showPassword });
    };

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        update({
            currentPassword: value,
            isInputValid: value.length > 0,
            invalidInputText: '',
        });
    };

    const onPasswordSubmit = (_event: React.MouseEvent<HTMLButtonElement>) => {
        if (!state.currentPassword) {
            return update({
                invalidInputText: 'Please enter a password',
                isInputValid: false,
            });
        }
        update({ isInputValid: true });
    };

    const bodyRef: React.RefObject<HTMLDivElement> = useRef(null);
    const inputProps = !state.isEmailEntered
        ? {}
        : {
              endAdornment: (
                  <InputAdornment position='end'>
                      <IconButton
                          aria-label='toggle password visibility'
                          onClick={onTogglePasswordViewClick}
                          edge='end'
                      >
                          {state.showPassword ? (
                              <VisibilityOff />
                          ) : (
                              <Visibility />
                          )}
                      </IconButton>
                  </InputAdornment>
              ),
          };

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
            InputProps={inputProps}
            onChange={onEmailChange}
        />
    ) : (
        <TextField
            fullWidth
            id='password'
            error={!state.isInputValid}
            value={state.currentPassword}
            label='Password'
            type={state.showPassword ? 'text' : 'password'}
            helperText={state.invalidInputText ?? ''}
            variant='standard'
            InputProps={inputProps}
            onChange={onPasswordChange}
        />
    );
    return (
        <div className='modal'>
            <div className='header'>
                <div className='logo'></div>
                <div className='title'>HEXAGON</div>
            </div>
            <div className='body' ref={bodyRef}>
                <Slide
                    direction='down'
                    in={state.isEmailEntered}
                    container={bodyRef.current}
                    unmountOnExit
                >
                    <div className='username-greeting'>
                        Welcome,{' '}
                        <span id='current-email'>{state.currentEmail}</span>.
                    </div>
                </Slide>
                <div id='prompt'>
                    {state.isEmailEntered
                        ? 'Enter your master password to continue.'
                        : 'Enter your email to begin.'}
                </div>
                {input}
            </div>
            <div className='footer'>
                <Button
                    variant='contained'
                    onClick={
                        state.isEmailEntered ? onPasswordSubmit : onEmailSubmit
                    }
                >
                    {state.isEmailEntered
                        ? state.isSignUp
                            ? 'Sign Up'
                            : 'Sign In'
                        : 'Continue'}
                </Button>
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
    );
}
