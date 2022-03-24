import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import { useState } from 'react';
import { useAppSelector } from '../../../store/store';
import parser from '../../../utils/parser';
import AppModal from '../../shared/AppModal';
import PasswordField from '../../shared/PasswordField';

export type CredentialEditorProps = {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    url?: string;
    user?: string;
    password?: string;
};

type CredentialEditorState = {
    isURLValid: boolean;
    isUserValid: boolean;
    isPassValid: boolean;
    urlError: string;
    userError: string;
    passwordError: string;
    url: string;
    user: string;
    password: string;
    isLoading: boolean;
};

const createCryptoWorker = createWorkerFactory(
    () => import('../../../workers/CryptoWorker')
);

const initState = {
    isURLValid: true,
    isUserValid: true,
    isPassValid: true,
    urlError: '',
    userError: '',
    passwordError: '',
    url: '',
    user: '',
    password: '',
    isLoading: false,
};
export default function CredentialEditor(props: CredentialEditorProps) {
    const [state, setState] = useState(initState);
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useWorker(createCryptoWorker);

    const update = (update: Partial<CredentialEditorState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    const onURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        let isURLValid = true;
        try {
            parser.extractDomain(value);
        } catch (error: any) {
            isURLValid = false;
        }

        update({
            url: value,
            isURLValid,
            urlError: '',
        });
    };

    const onUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        update({
            user: value,
            isUserValid: value.length > 0,
            userError: '',
        });
    };

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        update({
            password: value,
            isPassValid: value.length > 0,
            passwordError: '',
        });
    };

    const onClose = () => {
        update(initState);
        props.setIsOpen(false);
    };

    const onCreateSubmit = async () => {
        /**
         * Check if all fields valid, if not, then create helper text and quit
         * Encrypt the username and password with the master key
         * Check if the username already in use, if it is then offer to update it.
         * send to the server
         * close the modal
         * add to the list
         */
        let error = false;
        if (!state.isURLValid || !state.url) {
            update({ urlError: 'Please enter a valid URL', isURLValid: false });
            error = true;
        }
        if (!state.isUserValid || !state.user) {
            update({
                userError: 'Please enter a username',
                isUserValid: false,
            });
            error = true;
        }
        if (!state.isPassValid || !state.password) {
            update({
                passwordError: 'Please enter a password',
                isPassValid: false,
            });
            error = true;
        }
        if (error) return;
        try {
            const [encryptedUser, encryptedPass] = await Promise.all([
                cryptoWorker.encryptData(state.user, account.masterKey),
                cryptoWorker.encryptData(state.password, account.masterKey),
            ]);
            // check if username in use already
        } catch (error) {
            console.log(error);
        }
        update(initState);
        props.setIsOpen(false);
    };

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={'Create Credentials'}
            onClose={onClose}
        >
            <TextField
                fullWidth
                error={!state.isURLValid}
                label='URL'
                value={state.url}
                type='url'
                helperText={state.urlError ?? ''}
                variant='standard'
                onChange={onURLChange}
            />
            <TextField
                fullWidth
                error={!state.isUserValid}
                label='Username / Email'
                value={state.user}
                type='text'
                helperText={state.userError ?? ''}
                variant='standard'
                onChange={onUserChange}
                sx={{ my: 1 }}
            />
            <PasswordField
                isError={!state.isPassValid}
                password={state.password}
                onPasswordChange={onPasswordChange}
                errorMessage={state.passwordError}
            />
            <Box sx={{ float: 'right', mt: 2 }}>
                <Button
                    variant='contained'
                    onClick={onCreateSubmit}
                    disabled={state.isLoading}
                >
                    Submit
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
        </AppModal>
    );
}
