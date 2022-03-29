import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { consumeToast, sendToast, Toast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import './App.scss';

const UpTransition = (props: any) => {
    return <Slide {...props} direction='up' />;
};

export default function App() {
    const { toast: toastQueue, account } = useAppSelector((state) => state);
    const [isToastOpen, setIsToastOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (location.pathname === '/')
            navigate(account.email ? '/app/credentials' : '/authenticate');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    useEffect(() => {
        if (toastQueue.length) setIsToastOpen(true);
    }, [toastQueue.length]);

    const onToastClose = useCallback(
        (
            event?: React.SyntheticEvent | Event,
            reason?: SnackbarCloseReason
        ) => {
            if (reason === 'clickaway') return;
            const hasMore = toastQueue.length > 1;
            setIsToastOpen(false);
            setTimeout(() => {
                if (hasMore) setIsToastOpen(true);
                dispatch(consumeToast());
            }, 300);
        },
        []
    );

    return (
        <div id='app' className='background'>
            <Outlet />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={isToastOpen}
                autoHideDuration={6000}
                onClose={onToastClose}
                TransitionComponent={UpTransition}
            >
                <Alert
                    variant='filled'
                    onClose={onToastClose}
                    severity={
                        toastQueue.length ? toastQueue[0].severity : 'error'
                    }
                    sx={{ width: '100%' }}
                >
                    {toastQueue.length ? toastQueue[0].message : ''}
                </Alert>
            </Snackbar>
        </div>
    );
}
