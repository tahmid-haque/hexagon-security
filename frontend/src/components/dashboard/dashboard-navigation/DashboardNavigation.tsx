import styles from './DashboardNavigation.module.scss';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import {
    Typography,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    useTheme,
    Theme,
    CSSObject,
    Box,
    CssBaseline,
    Icon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Outlet } from 'react-router-dom';
import { navWidth } from '../../../shared/constants';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyIcon from '@mui/icons-material/Key';
import LockClockIcon from '@mui/icons-material/LockClock';
import NotesIcon from '@mui/icons-material/Notes';
import SafetyCheckIcon from '@mui/icons-material/SafetyCheck';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const openedMixin = (theme: Theme): CSSObject => ({
    width: navWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    flexDirection: 'row',
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
    width: navWidth,
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
};

type DashboardNavigationProps = {
    onNavClose: () => void;
    isNavOpen: boolean;
};

const getFeatureButtons = (features: Feature[], isNavOpen: boolean) => {
    return features.map(({ name, icon }) => (
        <ListItemButton
            key={name}
            sx={{
                height: 48,
                // maxHeight: 48,
                justifyContent: isNavOpen ? 'initial' : 'center',
                px: 2.5,
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: isNavOpen ? 3 : 'auto',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </ListItemIcon>
            <ListItemText primary={name} sx={{ opacity: isNavOpen ? 1 : 0 }} />
        </ListItemButton>
    ));
};

export default function DashboardNavigation(props: DashboardNavigationProps) {
    const features = [
        {
            name: 'Passwords',
            icon: <KeyIcon />,
        },
        {
            name: 'Multi-Factor Authentication',
            icon: <LockClockIcon />,
        },
        {
            name: 'Notes',
            icon: <NotesIcon />,
        },
        {
            name: 'Security Analyzer',
            icon: <SafetyCheckIcon />,
        },
        {
            name: 'Settings',
            icon: <SettingsIcon />,
        },
    ] as Feature[];

    const featureButtons = getFeatureButtons(features, props.isNavOpen);

    return (
        <Drawer
            variant='permanent'
            open={props.isNavOpen}
            className={`${styles.navigation} ${props.isNavOpen ? 'open' : ''}`}
        >
            <div className={styles.options}>
                <div>
                    <DrawerHeader>
                        <div className={styles.logo}></div>
                        <div className={styles['nav-title']}>HEXAGON</div>
                        <IconButton onClick={props.onNavClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </DrawerHeader>
                    <List>{featureButtons.slice(0, -1)}</List>
                </div>
                <div>{featureButtons.slice(-1)}</div>
            </div>
        </Drawer>
    );
}
