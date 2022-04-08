import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import { Box } from '@mui/material';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AccountService from '../../services/AccountService';
import CredentialService from '../../services/CredentialService';
import { Account } from '../../store/slices/AccountSlice';
import {
    clearEvent,
    createEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { Display } from '../../store/slices/DisplaySlice';
import { saveNextLocation } from '../../store/slices/LocationSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import Settings from '../settings/Settings';
import ShareManager from '../shares/ShareManager';
import DashboardHeader from './dashboard-header/DashboardHeader';
import DashboardNavigation from './dashboard-navigation/DashboardNavigation';

// Note: much of the dashboard header and navigation components are designed based on the MUI example
//       here: https://mui.com/material-ui/react-drawer/

// create the crypto web worker initializer
const createCryptoWorker = createWorkerFactory(
    () => import('../../workers/CryptoWorker')
);

type DashboardState = {
    isNavOpen: boolean;
    isShareOpen: boolean;
    isDashShown: boolean;
    isSettingsOpen: boolean;
    currentPane: Display;
    accountService: AccountService;
    credentialService: CredentialService;
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

/**
 * Handle signing out the user
 * @param this context in which to execute the function
 */
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

/**
 * Handle dashboard events dispatched by Redux
 * @param this context in which to execute the function
 */
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

/**
 * Initialize the dashboard by checking for authentication and redirecting as needed
 * @param this context in which to execute the function
 */
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

/**
 * Dashboard component housing all of the app's main functions
 * @param props props used to configure the Dashboard
 * @returns a Dashboard component
 */
export default function Dashboard() {
    const account = useAppSelector((state) => state.account);
    const display: Display = useAppSelector((state) => state.display);
    const event = useAppSelector((state) => state.dashboard);
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const cryptoWorker = useWorker(createCryptoWorker);

    const { state, update } = useComponentState({
        isNavOpen: false,
        isDashShown: false,
        isShareOpen: false,
        isSettingsOpen: false,
        accountService: new AccountService(),
        credentialService: new CredentialService(
            cryptoWorker,
            account,
            apolloClient
        ),
    } as DashboardState);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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
                        credentialService={state.credentialService}
                    />
                </Box>
            )}
        </Box>
    );
}
