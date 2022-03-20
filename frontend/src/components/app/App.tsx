import React, { SyntheticEvent, useEffect } from 'react';
import './App.scss';
import AuthForm from '../auth-form/AuthForm';
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
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const UpTransition = (props: any) => {
    return <Slide {...props} direction='up' />;
};

export default function App() {
    const { toast, account } = useAppSelector((state) => state);
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/')
            navigate(account.email ? '/app/credentials' : '/authenticate');
    }, [location]);

    const onToastClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason
    ) => {
        if (reason === 'clickaway') return;
        appDispatch(
            sendToast({
                isOpen: false,
            })
        );
    };

    return (
        <div id='app' className='background'>
            <Outlet />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={toast.isOpen}
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
        </div>
    );
}
