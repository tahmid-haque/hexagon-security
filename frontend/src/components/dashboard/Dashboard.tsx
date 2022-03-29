import { Box, styled } from '@mui/material';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Account } from '../../store/slices/AccountSlice';
import { Display } from '../../store/slices/DisplaySlice';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import DashboardHeader from './dashboard-header/DashboardHeader';
import DashboardNavigation from './dashboard-navigation/DashboardNavigation';

// Note: much of the dashboard header and navigation components are designed based on the MUI example here - https://mui.com/material-ui/react-drawer/

const createCryptoWorker = createWorkerFactory(
    () => import('../../workers/CryptoWorker')
);

type DashboardState = {
    isNavOpen: boolean;
    isDashShown: boolean;
    currentPane: Display;
};

type DashboardContext = {
    account: Account;
    display: Display;
    state: DashboardState;
    update: (update: Partial<DashboardState>) => void;
    navigate: any;
    dispatch: any;
    cryptoWorker: any;
};

const handleDisplayChange = function (this: DashboardContext) {
    const { display, navigate } = this;
    switch (display) {
        case Display.CREDENTIALS:
            navigate('/app/credentials');
            break;

        case Display.MFA:
            navigate('/app/mfa');
            break;

        default:
            break;
    }
};

const handleAccountChange = function (this: DashboardContext) {
    const { state, account, update, navigate, dispatch } = this;
    if (state.isDashShown && !account.email) {
        update({ isDashShown: false });
        setTimeout(() => {
            dispatch(
                sendToast({
                    message: 'Successfully signed out.',
                    severity: 'success',
                })
            );
            navigate('/authenticate');
        }, 300);
    }
};

export default function Dashboard() {
    const account = useAppSelector((state) => state.account);
    const display = useAppSelector((state) => state.display);
    const { state, update } = useComponentState({
        isNavOpen: false,
        isDashShown: false,
    } as DashboardState);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const cryptoWorker = useWorker(createCryptoWorker);

    const context = {
        account,
        display,
        state,
        update,
        navigate,
        dispatch,
        cryptoWorker,
    };

    const onNavOpen = () => {
        update({ isNavOpen: true });
    };

    const onNavClose = () => {
        update({ isNavOpen: false });
    };

    useEffect(() => {
        setTimeout(() => {
            if (account.email) update({ isDashShown: true });
            else navigate('/authenticate');
        }, 1);
    }, []);
    useEffect(handleAccountChange.bind(context), [account]);
    useEffect(handleDisplayChange.bind(context), [display]);

    return (
        <Box sx={{ display: 'flex' }}>
            <DashboardHeader
                isNavOpen={state.isNavOpen}
                onNavOpen={onNavOpen}
                isShown={state.isDashShown}
                currentPane={display}
            ></DashboardHeader>
            <DashboardNavigation
                isNavOpen={state.isNavOpen}
                isShown={state.isDashShown}
                onNavClose={onNavClose}
                email={account.email}
                currentPane={display}
            ></DashboardNavigation>
            {state.isDashShown && (
                <Box
                    sx={{
                        width: '100%',
                        height: 'calc(100vh - 56px)',
                        overflowY: 'auto',
                        marginTop: '56px',
                        '@media (min-width: 600px)': {
                            height: 'calc(100vh - 64px)',
                            marginTop: '64px',
                        },
                    }}
                >
                    <Outlet context={cryptoWorker} />
                </Box>
            )}
        </Box>
    );
}
