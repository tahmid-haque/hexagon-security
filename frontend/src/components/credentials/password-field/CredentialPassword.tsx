import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, Input, InputAdornment, Tooltip } from '@mui/material';
import { useState } from 'react';
import { sendToast, Toast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';

export default function CredentialPassword(props: { password: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();

    const onDoubleClick = () => {
        navigator.clipboard
            .writeText(props.password)
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
            <Input
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={showPassword ? props.password : 'password'}
                sx={{
                    borderBottom: 'none',
                    '::after, ::before': {
                        borderBottom: 'none!important', // override MUI styling
                    },
                    textOverflow: 'ellipsis',
                }}
                onDoubleClick={onDoubleClick}
                endAdornment={
                    <InputAdornment position='end' sx={{ mr: 1 }}>
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setShowPassword(!showPassword)}
                            edge='end'
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                readOnly={true}
            />
        </Tooltip>
    );
}
