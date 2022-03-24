import { Box, Tooltip } from '@mui/material';
import { sendToast, Toast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';

export default function CredentialUser(props: { user: string }) {
    const dispatch = useAppDispatch();
    const onDoubleClick = () => {
        navigator.clipboard
            .writeText(props.user)
            .then(
                () =>
                    ({
                        message: 'Copied to clipboard!',
                        severity: 'success',
                    } as Partial<Toast>)
            )
            .catch(
                () =>
                    ({
                        message: 'Unable to copy.',
                        severity: 'error',
                    } as Partial<Toast>)
            )
            .then((toast) => dispatch(sendToast(toast)));
    };
    return (
        <Tooltip title='Double click to copy'>
            <Box
                onDoubleClick={onDoubleClick}
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
