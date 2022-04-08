import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardEventType } from '../../store/slices/DashboardSlice';
import {
    clearToasts,
    consumeToast,
    sendToast,
} from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import './App.scss';

/**
 * Transition component used for toasts
 * @param props props to pass the MUI Snackbar
 * @returns an UpTransition component
 */
const UpTransition = (props: any) => {
    return <Slide {...props} direction='up' />;
};

/**
 * App component housing the Hexagon frontend main component
 * @returns an App component
 */
export default function App() {
    const { toast: toastQueue, dashboard: event } = useAppSelector(
        (state) => state
    );
    const [isToastOpen, setIsToastOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    // event handler for hiding toasts
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
        [dispatch, toastQueue.length]
    );

    // default routing
    useEffect(() => {
        if (location.pathname === '/') navigate('/app/credentials');
    }, [location]);

    // show a toast if available
    useEffect(() => {
        if (toastQueue.length) setIsToastOpen(true);
    }, [toastQueue.length]);

    // event handler for signing out the user
    useEffect(() => {
        if (event.type !== DashboardEventType.SIGNOUT) return;
        setIsToastOpen(false);
        setTimeout(() => {
            dispatch(clearToasts());
            dispatch(
                sendToast({
                    message: 'Successfully signed out.',
                    severity: 'success',
                })
            );
        }, 300);
    }, [event, dispatch]);

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
