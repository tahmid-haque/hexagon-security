import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import CredentialService from '../../../services/CredentialService';
import { sendToast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';
import parser from 'hexagon-shared/utils/parser';
import AppModal from '../../shared/AppModal';
import PasswordField from '../../shared/PasswordField';
import { MFA } from '../MFAView';
import { useComponentState } from '../../../utils/hooks';
import MFAService from '../../../services/MFAService';

export type MFACreatorProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    mfaService: MFAService;
};

type MFACreatorState = {
    isURLValid: boolean;
    isUserValid: boolean;
    isSecretValid: boolean;
    urlError: string;
    userError: string;
    secretError: string;
    url: string;
    user: string;
    secret: string;
    isLoading: boolean;
};

const initState: MFACreatorState = {
    isURLValid: true,
    isUserValid: true,
    isSecretValid: true,
    urlError: '',
    userError: '',
    secretError: '',
    url: '',
    user: '',
    secret: '',
    isLoading: false,
};

const onURLChange = (
    update: (update: Partial<MFACreatorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
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

const onUserChange = (
    update: (update: Partial<MFACreatorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        user: value,
        isUserValid: value.length > 0,
        userError: '',
    });
};

const onSecretChange = (
    update: (update: Partial<MFACreatorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value.toUpperCase();
    update({
        secret: value.toUpperCase(),
        isSecretValid: parser.isBase32(value),
        secretError: '',
    });
};

const onClose = (
    update: (update: Partial<MFACreatorState>) => void,
    close: (modified: boolean) => void,
    modified: boolean
) => {
    update(initState);
    close(modified);
};

const validateForm = (
    state: MFACreatorState,
    update: (update: Partial<MFACreatorState>) => void
) => {
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
    if (!state.isSecretValid || !state.secret) {
        update({
            secretError: 'Please enter a secret',
            isSecretValid: false,
        });
        error = true;
    }
    return error;
};

const onCreateSubmit = async (
    state: MFACreatorState,
    update: (update: Partial<MFACreatorState>) => void,
    props: MFACreatorProps,
    dispatch: any
) => {
    if (validateForm(state, update)) return;
    update({ isLoading: true });
    try {
        await props.mfaService.createMFA(
            parser.extractDomain(state.url),
            state.user,
            state.secret
        );
        dispatch(
            sendToast({
                message: 'Successfully created your credential.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false });
        const message =
            error.status == 409
                ? 'This MFA credential already exists. Cannot overwrite it.'
                : 'Something went wrong and we were unable to save your credential. Try again later.';
        return dispatch(
            sendToast({
                message,
                severity: 'error',
            })
        );
    }
    onClose(update, props.onClose, true);
};

export default function MFAEditor(props: MFACreatorProps) {
    const { state, update } = useComponentState(initState);
    const dispatch = useAppDispatch();

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={'Create MFA Credential'}
            onClose={onClose.bind(null, update, props.onClose, false)}
        >
            <TextField
                fullWidth
                error={!state.isURLValid}
                label='URL'
                value={state.url}
                type='url'
                helperText={state.urlError ?? ''}
                variant='standard'
                onChange={onURLChange.bind(null, update)}
            />
            <TextField
                fullWidth
                error={!state.isUserValid}
                label='Username / Email'
                value={state.user}
                type='text'
                helperText={state.userError ?? ''}
                variant='standard'
                onChange={onUserChange.bind(null, update)}
                sx={{ my: 1 }}
            />
            <PasswordField
                isError={!state.isSecretValid}
                password={state.secret}
                onPasswordChange={onSecretChange.bind(null, update)}
                errorMessage={state.secretError}
                label='Secret'
            />
            <Box sx={{ float: 'right', mt: 2, position: 'relative' }}>
                <Button
                    variant='contained'
                    onClick={() =>
                        onCreateSubmit(state, update, props, dispatch)
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
