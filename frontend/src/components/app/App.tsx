import React, { SyntheticEvent } from 'react';
import './App.scss';
import AuthForm from '../auth-form/AuthForm';
import colors from '../../shared/colors.module.scss';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar, {
    SnackbarCloseReason,
    SnackbarOrigin,
} from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { connect } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { sendToast, Toast } from '../../store/slices/ToastSlice';
import Slide from '@mui/material/Slide';

const muiTheme = createTheme({
    palette: {
        primary: {
            main: colors.primary,
            light: colors.lightPrimary,
            dark: colors.darkPrimary,
        },
        secondary: {
            main: colors.secondary,
            light: colors.lightSecondary,
            dark: colors.darkSecondary,
        },
    },
    typography: {
        fontFamily: ['Lato', 'Roboto', 'Helvetica', 'Ariel', 'sans-serif'].join(
            ','
        ),
    },
});

export default function App() {
    const toast = useAppSelector((state) => state.toast.toast);
    const appDispatch = useAppDispatch();

    const onToastClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason
    ) => {
        if (reason === 'clickaway') return;
        appDispatch(
            sendToast({
                message: '',
                severity: 'error',
            })
        );
    };

    const UpTransition = (props: any) => {
        return <Slide {...props} direction='up' />;
    };

    return (
        <ThemeProvider theme={muiTheme}>
            <div id='app' className='background'>
                <AuthForm></AuthForm>
            </div>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={toast.message.length > 0}
                autoHideDuration={6000}
                onClose={onToastClose}
                TransitionComponent={UpTransition}
            >
                <Alert
                    variant='filled'
                    onClose={onToastClose}
                    severity={toast.severity}
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
