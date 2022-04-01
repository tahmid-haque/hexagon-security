import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

export type PasswordFieldProps = {
    password: string;
    readonly?: boolean;
    errorMessage?: string;
    isError?: boolean;
    label?: string;
    onPasswordChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordViewToggle?: (isPassViewable: boolean) => void;
};

const onTogglePasswordViewClick = function (this: {
    props: PasswordFieldProps;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { setShowPassword, props } = this;
    setShowPassword((showPassword) => {
        if (props.onPasswordViewToggle)
            props.onPasswordViewToggle(showPassword);
        return !showPassword;
    });
};

export default function PasswordField(props: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextField
            fullWidth
            error={props.isError}
            value={props.password}
            label={`${props.label ?? 'Password'}`}
            type={showPassword ? 'text' : 'password'}
            helperText={props.errorMessage ?? ''}
            variant='standard'
            InputProps={{
                readOnly: props.readonly ?? false,
                endAdornment: (
                    <InputAdornment position='end'>
                        <Tooltip
                            arrow
                            title={`${showPassword ? 'Hide' : 'Show'} ${
                                props.label ?? 'Password'
                            }`}
                        >
                            <IconButton
                                aria-label='toggle password visibility'
                                onClick={onTogglePasswordViewClick.bind({
                                    setShowPassword,
                                    props,
                                })}
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
