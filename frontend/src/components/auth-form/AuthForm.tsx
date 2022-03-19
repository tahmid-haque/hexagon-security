import React from 'react';
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

type AuthFormState = {
    isSignUp: boolean;
    isEmailEntered: boolean;
    showPassword: boolean;
    currentEmail: string;
    currentPassword: string;
    isInputValid: boolean;
    invalidInputText?: string;
};

class AuthForm extends React.Component<any, AuthFormState> {
    bodyRef: React.RefObject<HTMLDivElement>;

    constructor(props: never) {
        super(props);
        this.state = {
            isSignUp: false,
            isEmailEntered: false,
            showPassword: false,
            currentEmail: '',
            currentPassword: '',
            isInputValid: true,
        };
        this.bodyRef = React.createRef();
    }

    onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        // taken from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
        const emailMatcher =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const value = event.target.value;
        const isInputValid = emailMatcher.test(value.toLowerCase());
        this.setState({
            currentEmail: value,
            invalidInputText: '',
            isInputValid,
        });
    }

    onEmailSubmit(_event: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.isInputValid || !this.state.currentEmail) {
            return this.setState({
                invalidInputText: 'Please enter a valid email',
                isInputValid: false,
            });
        }
        this.setState({ isEmailEntered: true });
    }

    onBackButtonClick(_event: React.MouseEvent<HTMLButtonElement>) {
        this.setState({
            isEmailEntered: false,
            currentPassword: '',
            showPassword: false,
        });
    }

    onTogglePasswordViewClick(_event: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ showPassword: !this.state.showPassword });
    }

    onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        this.setState({
            currentPassword: value,
            isInputValid: value.length > 0,
            invalidInputText: '',
        });
    }

    onPasswordSubmit(_event: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.currentPassword) {
            return this.setState({
                invalidInputText: 'Please enter a password',
                isInputValid: false,
            });
        }
        this.setState({ isInputValid: true });
    }

    render() {
        const inputProps = !this.state.isEmailEntered
            ? {}
            : {
                  endAdornment: (
                      <InputAdornment position='end'>
                          <IconButton
                              aria-label='toggle password visibility'
                              onClick={this.onTogglePasswordViewClick.bind(
                                  this
                              )}
                              // onMouseDown={handleMouseDownPassword}
                              edge='end'
                          >
                              {this.state.showPassword ? (
                                  <VisibilityOff />
                              ) : (
                                  <Visibility />
                              )}
                          </IconButton>
                      </InputAdornment>
                  ),
              };

        const input = !this.state.isEmailEntered ? (
            <TextField
                fullWidth
                id='email'
                error={!this.state.isInputValid}
                label='Email'
                value={this.state.currentEmail}
                type='email'
                helperText={this.state.invalidInputText ?? ''}
                variant='standard'
                InputProps={inputProps}
                onChange={this.onEmailChange.bind(this)}
            />
        ) : (
            <TextField
                fullWidth
                id='password'
                error={!this.state.isInputValid}
                value={this.state.currentPassword}
                label='Password'
                type={this.state.showPassword ? 'text' : 'password'}
                helperText={this.state.invalidInputText ?? ''}
                variant='standard'
                InputProps={inputProps}
                onChange={this.onPasswordChange.bind(this)}
            />
        );

        return (
            <div className='modal'>
                <div className='header'>
                    <div className='logo'></div>
                    <div className='title'>HEXAGON</div>
                </div>
                <div className='body' ref={this.bodyRef}>
                    <Slide
                        direction='down'
                        in={this.state.isEmailEntered}
                        container={this.bodyRef.current}
                        unmountOnExit
                    >
                        <div className='username-greeting'>
                            Welcome,{' '}
                            <span id='current-email'>
                                {this.state.currentEmail}
                            </span>
                            .
                        </div>
                    </Slide>
                    <div id='prompt'>
                        {this.state.isEmailEntered
                            ? 'Enter your master password to continue.'
                            : 'Enter your email to begin.'}
                    </div>
                    {input}
                </div>
                <div className='footer'>
                    <Button
                        variant='contained'
                        onClick={
                            this.state.isEmailEntered
                                ? this.onPasswordSubmit.bind(this)
                                : this.onEmailSubmit.bind(this)
                        }
                    >
                        {this.state.isEmailEntered
                            ? this.state.isSignUp
                                ? 'Sign Up'
                                : 'Sign In'
                            : 'Continue'}
                    </Button>
                    <Slide
                        direction='up'
                        in={this.state.isEmailEntered}
                        container={this.bodyRef.current}
                        unmountOnExit
                    >
                        <Button
                            variant='text'
                            startIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                            onClick={this.onBackButtonClick.bind(this)}
                        >
                            Use different email
                        </Button>
                    </Slide>
                </div>
            </div>
        );
    }
}

export default AuthForm;
