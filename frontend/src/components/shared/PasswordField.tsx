import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

export type PasswordFieldProps = {
    password: string;
    readonly?: boolean;
    errorMessage?: string;
    isError?: boolean;
    onPasswordChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordViewToggle?: (isPassViewable: boolean) => void;
};

export default function PasswordField(props: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const onTogglePasswordViewClick = (
        _event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setShowPassword((showPassword) => {
            if (props.onPasswordViewToggle)
                props.onPasswordViewToggle(showPassword);
            return !showPassword;
        });
    };

    return (
        <TextField
            fullWidth
            id='password'
            error={props.isError}
            value={props.password}
            label='Password'
            type={showPassword ? 'text' : 'password'}
            helperText={props.errorMessage ?? ''}
            variant='standard'
            InputProps={{
                readOnly: props.readonly ?? false,
                endAdornment: (
                    <InputAdornment position='end'>
                        <Tooltip
                            title={`${showPassword ? 'Hide' : 'Show'} Password`}
                        >
                            <IconButton
                                aria-label='toggle password visibility'
                                onClick={onTogglePasswordViewClick}
                                edge='end'
                            >
                                {showPassword ? (
                                    <VisibilityOff />
                                ) : (
                                    <Visibility />
                                )}
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>
                ),
            }}
            onChange={props.onPasswordChange}
        />
    );
}
