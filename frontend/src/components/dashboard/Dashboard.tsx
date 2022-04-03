import { Box } from '@mui/material';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Account } from '../../store/slices/AccountSlice';
import {
    clearEvent,
    createEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { Display } from '../../store/slices/DisplaySlice';
import { saveNextLocation } from '../../store/slices/LocationSlice';
import { clearToasts, sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import Settings from '../settings/Settings';
import AccountService from '../../services/AccountService';
import ShareManager from '../shares/ShareManager';
import DashboardHeader from './dashboard-header/DashboardHeader';
import DashboardNavigation from './dashboard-navigation/DashboardNavigation';

// Note: much of the dashboard header and navigation components are designed based on the MUI example here - https://mui.com/material-ui/react-drawer/

const createCryptoWorker = createWorkerFactory(
    () => import('../../workers/CryptoWorker')
);

type DashboardState = {
    isNavOpen: boolean;
    isShareOpen: boolean;
    isDashShown: boolean;
    isSettingsOpen: boolean;
    currentPane: Display;
    accountService: AccountService
};

type DashboardContext = {
    account: Account;
    display: Display;
    state: DashboardState;
    update: (update: Partial<DashboardState>) => void;
    navigate: any;
    dispatch: any;
    cryptoWorker: any;
    event: DashboardEvent;
};

const handleAccountChange = function (this: DashboardContext) {
    const { state, account, update, navigate, dispatch } = this;
    if (state.isDashShown && !account.email) {
        update({ isDashShown: false });
        dispatch(createEvent({ type: DashboardEventType.SIGNOUT }));
        setTimeout(() => {
            window.localStorage.setItem('lastUser', '');
            navigate('/authenticate');
        }, 300);
    }
};

const handleEvent = function (this: DashboardContext) {
    const { event, update, dispatch } = this;
    switch (event.type) {
        case DashboardEventType.SHARE_CLICK:
            dispatch(clearEvent());
            this.update({
                isShareOpen: true,
            });
            break;

        case DashboardEventType.SETTINGS_CLICK:
            dispatch(clearEvent());
            update({
                isSettingsOpen: true,
            });
            break;

        default:
            break;
    }
};

const onInit = function (this: DashboardContext) {
    const { account, navigate, update, dispatch } = this;
    setTimeout(() => {
        if (account.email) update({ isDashShown: true });
        else {
            dispatch(
                saveNextLocation(
                    window.location.pathname + window.location.search
                )
            );
            navigate('/authenticate');
        }
    }, 1);
};

export default function Dashboard() {
    const account = useAppSelector((state) => state.account);
    const display: Display = useAppSelector((state) => state.display);
    const event = useAppSelector((state) => state.dashboard);
    const { state, update } = useComponentState({
        isNavOpen: false,
        isDashShown: false,
        isShareOpen: false,
        isSettingsOpen: false,
        accountService: new AccountService(),
    } as DashboardState);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const cryptoWorker = useWorker(createCryptoWorker);

    const context = {
        account,
        display,
        event,
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

    useEffect(onInit.bind(context), []);
    useEffect(handleAccountChange.bind(context), [account]);
    useEffect(handleEvent.bind(context), [event]);

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
                <Box>
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
                    <ShareManager
                        isOpen={state.isShareOpen}
                        onClose={() => update({ isShareOpen: false })}
                    />
                    <Settings 
                        isOpen={state.isSettingsOpen}
                        onClose={() => update({ isSettingsOpen: false })}
                        accountService={state.accountService}
                    />
                </Box>
            )}
        </Box>
    );
}
