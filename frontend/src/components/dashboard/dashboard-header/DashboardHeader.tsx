import MenuIcon from '@mui/icons-material/Menu';
import { styled, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import React, { useState } from 'react';
import { navWidth } from '../../../shared/constants';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: navWidth,
        width: `calc(100% - ${navWidth}px)`,
        transition: theme.transitions.create(['width', 'margin', 'transform'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

type DashboardHeaderProps = {
    onNavOpen: () => void;
    isNavOpen: boolean;
    isShown: boolean;
};

type DashboardHeaderState = {
    currentPane?: string;
};
export default function DashboardHeader(props: DashboardHeaderProps) {
    const [state, setState] = useState({} as DashboardHeaderState);

    return (
        <AppBar
            position='fixed'
            open={props.isNavOpen}
            sx={{ transform: `translateY(${props.isShown ? 0 : -64}px)` }}
        >
            <Toolbar>
                {!props.isNavOpen && (
                    <IconButton
                        aria-label='open navigation'
                        onClick={props.onNavOpen}
                        edge='start'
                        color='inherit'
                        sx={{ marginRight: 3 }}
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
