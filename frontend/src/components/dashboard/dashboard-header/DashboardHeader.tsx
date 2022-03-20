import styles from './DashboardHeader.module.scss';
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
import { width } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { navWidth } from '../../../shared/constants';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: navWidth,
        width: `calc(100% - ${navWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

type DashboardHeaderProps = {
    onNavOpen: () => void;
    isNavOpen: boolean;
};
export default function DashboardHeader(props: DashboardHeaderProps) {
    return (
        <AppBar position='fixed' open={props.isNavOpen}>
            <Toolbar>
                {!props.isNavOpen && (
                    <IconButton
                        aria-label='open navigation'
                        onClick={props.onNavOpen}
                        edge='start'
                        color='inherit'
                        sx={{ marginRight: 4 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant='h6' noWrap component='div'>
                    Credentials
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
