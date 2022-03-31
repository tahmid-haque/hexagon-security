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

const onDoubleClick = function (this: any) {
    const { dispatch, password } = this;
    navigator.clipboard
        .writeText(password)
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

export default function CredentialPassword(props: {
    password: string;
    shorten?: number;
    sx?: SxProps<Theme>;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();

    return (
        <Tooltip arrow title={props.password ? 'Double click to copy' : ''}>
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
                onDoubleClick={onDoubleClick.bind({
                    dispatch,
                    password: props.password,
                })}
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
