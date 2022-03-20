import styles from './Dashboard.module.scss';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './dashboard-header/DashboardHeader';
import DashboardNavigation from './dashboard-navigation/DashboardNavigation';

// Note: much of the dashboard header and navigation components are designed based on the MUI example here - https://mui.com/material-ui/react-drawer/

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

type DashboardState = {
    isNavOpen: boolean;
};

export default function Dashboard() {
    const [state, setState] = React.useState({
        isNavOpen: false,
    } as DashboardState);

    const update = (update: Partial<DashboardState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    const onNavOpen = () => {
        update({ isNavOpen: true });
    };

    const onNavClose = () => {
        update({ isNavOpen: false });
    };

    return (
        <div className={styles.container}>
            <DashboardHeader
                isNavOpen={state.isNavOpen}
                onNavOpen={onNavOpen}
            ></DashboardHeader>
            <DashboardNavigation
                isNavOpen={state.isNavOpen}
                onNavClose={onNavClose}
            ></DashboardNavigation>
            <div className={styles.main}>
                <Offset />
                <Outlet />
            </div>
        </div>
    );
}
