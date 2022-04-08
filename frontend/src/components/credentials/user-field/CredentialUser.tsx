import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { sendToast, Toast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';

/**
 * Double click event handler to copy a username to clipboard
 * @param this contains a dispatch function capable of dispatching redux actions and a username to copy
 */
const onDoubleClick = function (this: any) {
    const { user, dispatch } = this;
    navigator.clipboard
        .writeText(user)
        .then(
            () =>
                ({
                    message: 'Copied to clipboard!',
                    severity: 'success',
                } as Toast)
        )
        .catch(
            () =>
                ({
                    message: 'Unable to copy.',
                    severity: 'error',
                } as Toast)
        )
        .then((toast) => dispatch(sendToast(toast)));
};

/**
 * CredentialUser component used to display a username
 * @param props contains the username to display
 * @returns a CredentialUser component
 */
export default function CredentialUser(props: { user: string }) {
    const dispatch = useAppDispatch();
    return (
        <Tooltip arrow title={props.user ? 'Double click to copy' : ''}>
            <Box
                onDoubleClick={onDoubleClick.bind({
                    dispatch,
                    user: props.user,
                })}
                sx={{
                    width: '100%',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                }}
            >
                {props.user}
            </Box>
        </Tooltip>
    );
}
