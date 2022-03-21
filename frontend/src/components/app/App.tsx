import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import './App.scss';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
