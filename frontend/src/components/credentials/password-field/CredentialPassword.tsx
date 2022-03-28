import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    IconButton,
    Input,
    InputAdornment,
    SxProps,
    Theme,
    Tooltip,
} from '@mui/material';
import { useState } from 'react';
import { sendToast, Toast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';

export default function CredentialPassword(props: {
    password: string;
    shorten?: number;
    sx?: SxProps<Theme>;
}) {
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
                value={
                    showPassword
                        ? props.password
                        : '********'.slice(props.shorten ?? 0)
                }
                sx={{
                    borderBottom: 'none',
                    '::after, ::before': {
                        borderBottom: 'none!important', // override MUI styling
                    },
                    textOverflow: 'ellipsis',
                    ...props.sx,
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
