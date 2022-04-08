import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyIcon from '@mui/icons-material/Key';
import LockClockIcon from '@mui/icons-material/LockClock';
import LogoutIcon from '@mui/icons-material/Logout';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import {
    CircularProgress,
    CSSObject,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Theme,
    Tooltip,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountService from '../../../services/AccountService';
import { navWidth } from '../../../shared/constants';
import { clearAccount } from '../../../store/slices/AccountSlice';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';
import { Display } from '../../../store/slices/DisplaySlice';
import { sendToast } from '../../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import styles from './DashboardNavigation.module.scss';

const optionHeight = 48;

// CSS style for menu open
const openedMixin = (theme: Theme): CSSObject => ({
    width: navWidth,
    transition: theme.transitions.create(['width', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

// CSS style for menu close
const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create(['width', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

// create a styled div to show the logo and account information
const DrawerEnd = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    flexDirection: 'row',
    cursor: 'default',
}));

// create a styled DrawerEnd with height styling
const DrawerHeader = styled(DrawerEnd)(({ theme }) => ({
    ...theme.mixins.toolbar,
}));

// create a styled menu based on MuiDrawer
const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
    width: navWidth,
    height: '100vh',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

type Feature = {
    name: string;
    icon: JSX.Element;
    isActive?: boolean;
    onClick?: () => void;
};

type DashboardNavigationProps = {
    onNavClose: () => void;
    isNavOpen: boolean;
    isShown: boolean;
    email: string;
    currentPane: Display; // the current view
};

/**
 * Creates the menu items that'll be added to the navigation menu
 * @param this contains props passed to DashboardNavigation, a way to dispatch redux actions and a way to change the view
 * @returns the menu items
 */
const getFeatureButtons = function (this: {
    props: DashboardNavigationProps;
    dispatch: any;
    navigate: any;
}) {
    const { props, dispatch, navigate } = this;
    const features = [
        {
            name: 'Credentials',
            icon: <KeyIcon />,
            isActive: props.currentPane === Display.CREDENTIALS,
            onClick: () => navigate('/app/credentials'),
        },
        {
            name: 'Multi-Factor Authentication',
            icon: <LockClockIcon />,
            isActive: props.currentPane === Display.MFA,
            onClick: () => navigate('/app/mfa'),
        },
        {
            name: 'Notes',
            icon: <NotesIcon />,
            isActive: props.currentPane === Display.NOTES,
            onClick: () => navigate('/app/notes'),
        },
        {
            name: 'Settings',
            icon: <SettingsIcon />,
            onClick: () =>
                dispatch(
                    createEvent({ type: DashboardEventType.SETTINGS_CLICK })
                ),
        },
    ] as Feature[];

    return features.map(({ name, icon, isActive, onClick }) => (
        <ListItemButton
            key={name}
            sx={{
                height: optionHeight,
                px: 2.5,
            }}
            selected={isActive}
            onClick={onClick}
            disabled={props.currentPane === Display.NONE}
        >
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: props.isNavOpen ? 3 : 'auto',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </ListItemIcon>
            <ListItemText
                primary={name}
                sx={{ opacity: props.isNavOpen ? 1 : 0 }}
            />
        </ListItemButton>
    ));
};

/**
 * DashboardNavigation component used to allow navigation within the app
 * @param props props used to configure the DashboardNavigation
 * @returns a DashboardNavigation component
 */
export default function DashboardNavigation(props: DashboardNavigationProps) {
    const account = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [featureButtons, setFeatureButtons] = useState([] as JSX.Element[]);
    const [isLoading, setIsLoading] = useState(false);

    // update the menu buttons on view change or menu collapse/open
    useEffect(
        () =>
            setFeatureButtons(
                getFeatureButtons.call({ props, dispatch, navigate })
            ),
        [props.isNavOpen, props.currentPane]
    );

    // sign out the user by calling the backend and clearing credentials
    const onSignOutClick = async () => {
        try {
            setIsLoading(true);
            await new AccountService().signOut(account.jwt);
            dispatch(clearAccount());
        } catch (error) {
            dispatch(
                sendToast({
                    message: 'We were unable to sign you out.',
                    severity: 'error',
                })
            );
        }
        setIsLoading(false);
    };
    return (
        <Drawer
            variant='permanent'
            open={props.isNavOpen}
            sx={{ transform: `translateX(${props.isShown ? 0 : -290}px)` }}
        >
            <div className={styles.options}>
                <div>
                    <DrawerHeader
                        sx={{
                            transition: '195ms linear opacity',
                            opacity: props.isNavOpen ? 1 : 0,
                        }}
                    >
                        <div className={styles.logo}></div>
                        <div className={styles['nav-title']}>HEXAGON</div>
                        <IconButton onClick={props.onNavClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </DrawerHeader>
                    <List>{featureButtons.slice(0, -1)}</List>
                </div>
                <div>
                    {featureButtons.slice(-1)}
                    <DrawerEnd
                        sx={{
                            pl: 2.5,
                            height: optionHeight,
                            mb: 1,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: props.isNavOpen ? 3 : 'auto',
                                justifyContent: 'center',
                            }}
                        >
                            <Tooltip arrow title={props.email} placement='top'>
                                <AccountCircleIcon />
                            </Tooltip>
                        </ListItemIcon>
                        <ListItemText
                            primary='Sign Out'
                            sx={{ opacity: props.isNavOpen ? 1 : 0 }}
                        />
                        {props.isNavOpen && (
                            <IconButton
                                color='error'
                                onClick={onSignOutClick}
                                disabled={props.currentPane === Display.NONE}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <LogoutIcon />
                                )}
                            </IconButton>
                        )}
                    </DrawerEnd>
                </div>
            </div>
        </Drawer>
    );
}
