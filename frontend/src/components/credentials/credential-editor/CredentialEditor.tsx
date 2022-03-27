import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import CredentialService from '../../../services/CredentialService';
import { sendToast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';
import parser from '../../../utils/parser';
import AppModal from '../../shared/AppModal';
import PasswordField from '../../shared/PasswordField';
import { Credentials } from '../CredentialsView';

export type CredentialEditorProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    credentialService: CredentialService;
    isEdit: boolean;
    credential?: Credentials;
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
    const [state, setState] = useState({
        ...initState,
    });
    const dispatch = useAppDispatch();

    const update = (update: Partial<CredentialEditorState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    useEffect(() => {
        if (props.isEdit) {
            update({
                url: props.credential!.name,
                user: props.credential!.user,
                password: props.credential!.password,
            });
        }
    }, [props.credential, props.isOpen]);

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

    const onClose = (modified: boolean) => {
        update(initState);
        props.onClose(modified);
    };

    const validateForm = () => {
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
        return error;
    };

    const onCreateSubmit = async () => {
        if (validateForm()) return;
        update({ isLoading: true });
        try {
            await props.credentialService.createCredential(
                state.url,
                state.user,
                state.password
            );
            dispatch(
                sendToast({
                    message: 'Successfully created your credential.',
                    severity: 'success',
                })
            );
        } catch (error) {
            update({ isLoading: false });
            return dispatch(
                sendToast({
                    message:
                        'Something went wrong and we were unable to save your credential. Try again later.',
                })
            );
        }
        onClose(true);
    };

    const onEditSubmit = async () => {
        if (validateForm()) return;
        update({ isLoading: true });
        try {
            await props.credentialService.updateCredential(
                state.user,
                state.password,
                props.credential!
            );
            dispatch(
                sendToast({
                    message: 'Successfully updated your credential.',
                    severity: 'success',
                })
            );
        } catch (error) {
            update({ isLoading: false });
            return dispatch(
                sendToast({
                    message:
                        'Something went wrong and we were unable to save your credential. Try again later.',
                })
            );
        }
        onClose(true);
    };

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={`${props.isEdit ? 'Edit' : 'Create'} Credentials`}
            onClose={() => onClose(false)}
        >
            <TextField
                fullWidth
                disabled={props.isEdit}
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
            <Box sx={{ float: 'right', mt: 2, position: 'relative' }}>
                <Button
                    variant='contained'
                    onClick={() =>
                        props.isEdit ? onEditSubmit() : onCreateSubmit()
                    }
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
