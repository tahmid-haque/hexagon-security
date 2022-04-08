import { Box, Button, CircularProgress, TextField } from '@mui/material';
import parser from 'hexagon-shared/utils/parser';
import React, { useEffect } from 'react';
import CredentialService from '../../../services/CredentialService';
import { sendToast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';
import { useComponentState } from '../../../utils/hooks';
import AppModal from '../../shared/AppModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';
import PasswordField from '../../shared/PasswordField';
import { Credential } from '../CredentialsView';

export type CredentialEditorProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    credentialService: CredentialService;
    isEdit: boolean;
    credential?: Credential; // the credential to edit, if any
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
    id: string;
    key: string;
    isLoading: boolean;
    isExists: boolean;
    isOverwriteLoading: boolean;
};

const initState: CredentialEditorState = {
    isURLValid: true,
    isUserValid: true,
    isPassValid: true,
    urlError: '',
    userError: '',
    passwordError: '',
    url: '',
    user: '',
    password: '',
    id: '',
    key: '',
    isLoading: false,
    isExists: false,
    isOverwriteLoading: false,
};

/**
 * Initialize the editor with the new credential passed from the props
 * @param props the props passed to the CredentialEditor
 * @param update function used to update the state
 */
const onCredentialChange = (
    props: CredentialEditorProps,
    update: (update: Partial<CredentialEditorState>) => void
) => {
    if (props.isEdit && props.isOpen) {
        update({
            url: props.credential!.name,
            user: props.credential!.user,
            password: props.credential!.password,
            id: props.credential!.password,
            key: props.credential!.key,
        });
    }
};

/**
 * Event handler to handle URL field changes. Determine whether the URL is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
const onURLChange = (
    update: (update: Partial<CredentialEditorState>) => void,
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

/**
 * Event handler to handle username field changes. Determine whether the username is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
const onUserChange = (
    update: (update: Partial<CredentialEditorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        user: value,
        isUserValid: value.length > 0,
        userError: '',
    });
};

/**
 * Event handler to handle password field changes. Determine whether the password is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
const onPasswordChange = (
    update: (update: Partial<CredentialEditorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        password: value,
        isPassValid: value.length > 0,
        passwordError: '',
    });
};

/**
 * Event handler to handle close events
 * @param state the current state of the CredentialEditor
 * @param update function used to update the state
 * @param close callback to call on close with the modification update
 * @param modified whether a credential was updated/created
 */
const onClose = (
    state: CredentialEditorState,
    update: (update: Partial<CredentialEditorState>) => void,
    close: (modified: boolean) => void,
    modified: boolean
) => {
    if (state.isLoading || state.isOverwriteLoading) return;
    update(initState);
    close(modified);
};

/**
 * Determine whether the form is valid
 * @param state the current state of the CredentialEditor
 * @param update function used to update the state
 * @returns true if the form is valid, false otherwise
 */
const validateForm = (
    state: CredentialEditorState,
    update: (update: Partial<CredentialEditorState>) => void
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
    if (!state.isPassValid || !state.password) {
        update({
            passwordError: 'Please enter a password',
            isPassValid: false,
        });
        error = true;
    }
    return error;
};

/**
 * Event handler for handling credential creation. Check if the credential exists and if not
 * create the credential, otherwise offer to update.
 * @param state the current state of the CredentialEditor
 * @param update function used to update the state
 * @param props the props passed to the CredentialEditor
 * @param dispatch function used to dispatch redux actions
 */
const onCreateSubmit = async (
    state: CredentialEditorState,
    update: (update: Partial<CredentialEditorState>) => void,
    props: CredentialEditorProps,
    dispatch: any
) => {
    if (validateForm(state, update)) return;
    update({ isLoading: true });
    try {
        await props.credentialService.createCredential(
            parser.extractDomain(state.url),
            state.user,
            state.password
        );
        dispatch(
            sendToast({
                message: 'Successfully created your credential.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false });

        if (error.status === 409) {
            return update({
                isExists: true,
                id: error.id,
                key: error.key,
            });
        }

        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to save your credential. Try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false });
    onClose(state, update, props.onClose, true);
};

/**
 * Event handler for handling credential update. Updates the credential on the server.
 * @param state the current state of the CredentialEditor
 * @param update function used to update the state
 * @param props the props passed to the CredentialEditor
 * @param dispatch function used to dispatch redux actions
 */
const onEditSubmit = async (
    state: CredentialEditorState,
    update: (update: Partial<CredentialEditorState>) => void,
    props: CredentialEditorProps,
    dispatch: any
) => {
    if (validateForm(state, update)) return;

    update({ isLoading: !state.isExists, isOverwriteLoading: true });
    try {
        await props.credentialService.updateCredential(
            state.isExists ? state.id : props.credential!.id,
            parser.extractDomain(state.url),
            state.user,
            state.password,
            state.isExists ? state.key : props.credential!.key
        );
        dispatch(
            sendToast({
                message: 'Successfully updated your credential.',
                severity: 'success',
            })
        );
    } catch (error: any) {
        update({ isLoading: false, isOverwriteLoading: false });

        if (error.status === 409)
            return update({ isExists: true, id: error.id, key: error.key });

        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to save your credential. Try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false, isOverwriteLoading: false });
    onClose(state, update, props.onClose, true);
};

/**
 * CredentialEditor component used to edit/create website credentials
 * @param props props used to configure the CredentialEditor
 * @returns a CredentialEditor component
 */
export default function CredentialEditor(props: CredentialEditorProps) {
    const { state, update } = useComponentState(initState);
    const dispatch = useAppDispatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(onCredentialChange.bind(null, props, update), [
        props.credential,
        props.isOpen,
    ]);

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={`${props.isEdit ? 'Edit' : 'Create'} Credential`}
            onClose={onClose.bind(null, state, update, props.onClose, false)}
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
                isError={!state.isPassValid}
                password={state.password}
                onPasswordChange={onPasswordChange.bind(null, update)}
                errorMessage={state.passwordError}
            />
            <Box sx={{ float: 'right', mt: 2, position: 'relative' }}>
                <Button
                    variant='contained'
                    onClick={() =>
                        props.isEdit
                            ? onEditSubmit(state, update, props, dispatch)
                            : onCreateSubmit(state, update, props, dispatch)
                    }
                    disabled={state.isLoading}
                >
                    Save
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
            <ConfirmationDialog
                isOpen={state.isExists}
                onClose={() => update({ isExists: false })}
                onAccept={() => onEditSubmit(state, update, props, dispatch)}
                title='Error'
                body='This credential already exists. Would you like to update it instead?'
                isLoading={state.isOverwriteLoading}
            />
        </AppModal>
    );
}
