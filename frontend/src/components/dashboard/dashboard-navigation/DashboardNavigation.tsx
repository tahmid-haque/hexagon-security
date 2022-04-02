import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyIcon from '@mui/icons-material/Key';
import LockClockIcon from '@mui/icons-material/LockClock';
import LogoutIcon from '@mui/icons-material/Logout';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import {
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
import { navWidth } from '../../../shared/constants';
import { clearAccount } from '../../../store/slices/AccountSlice';
import { Display, setDisplay } from '../../../store/slices/DisplaySlice';
import { useAppDispatch } from '../../../store/store';
import styles from './DashboardNavigation.module.scss';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';

const optionHeight = 48;

const openedMixin = (theme: Theme): CSSObject => ({
    width: navWidth,
    transition: theme.transitions.create(['width', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

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

const DrawerEnd = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    flexDirection: 'row',
    cursor: 'default',
}));

const DrawerHeader = styled(DrawerEnd)(({ theme }) => ({
    ...theme.mixins.toolbar,
}));

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
    currentPane: Display;
};

const getFeatureButtons = function (this: {
    props: DashboardNavigationProps;
    dispatch: any;
}) {
    const { props, dispatch } = this;
    const features = [
        {
            name: 'Credentials',
            icon: <KeyIcon />,
            isActive: props.currentPane === Display.CREDENTIALS,
            onClick: () => dispatch(setDisplay(Display.CREDENTIALS)),
        },
        {
            name: 'Multi-Factor Authentication',
            icon: <LockClockIcon />,
            isActive: props.currentPane === Display.MFA,
            onClick: () => dispatch(setDisplay(Display.MFA)),
        },
        {
            name: 'Notes',
            icon: <NotesIcon />,
            isActive: props.currentPane === Display.NOTES,
            onClick: () => dispatch(setDisplay(Display.NOTES)),
        },
        {
            name: 'Settings',
            icon: <SettingsIcon />,
            // isActive: props.currentPane === 'Settings',
            onClick: () => dispatch(createEvent({ type: DashboardEventType.SETTINGS_CLICK })),
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

export default function DashboardNavigation(props: DashboardNavigationProps) {
    const dispatch = useAppDispatch();
    const [featureButtons, setFeatureButtons] = useState([] as JSX.Element[]);

    useEffect(
        () => setFeatureButtons(getFeatureButtons.call({ props, dispatch })),
        [props.isNavOpen, props.currentPane]
    );

    const onSignOutClick = () => {
        dispatch(clearAccount());
    };
    return (
        <Drawer
            variant='permanent'
            open={props.isNavOpen}
            sx={{ transform: `translateX(${props.isShown ? 0 : -64}px)` }}
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
                            <IconButton color='error' onClick={onSignOutClick}>
                                <LogoutIcon />
                            </IconButton>
                        )}
                    </DrawerEnd>
                </div>
            </div>
        </Drawer>
    );
}
