import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Collapse, styled, Tooltip, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import React, { useState } from 'react';
import { navWidth } from '../../../shared/constants';
import {
    createEvent,
    DashboardEvent,
} from '../../../store/slices/DashboardSlice';
import { useAppDispatch } from '../../../store/store';

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
    const dispatch = useAppDispatch();

    const onCreateClick = () => {
        dispatch(createEvent(DashboardEvent.CREATE_CLICK));
    };

    return (
        <AppBar
            position='fixed'
            open={props.isNavOpen}
            sx={{ transform: `translateY(${props.isShown ? 0 : -64}px)`, p: 0 }}
        >
            <Toolbar sx={{ paddingLeft: '0 !important' }}>
                <Collapse
                    in={!props.isNavOpen}
                    orientation='horizontal'
                    timeout={195}
                    unmountOnExit
                >
                    <IconButton
                        aria-label='open navigation'
                        onClick={props.onNavOpen}
                        edge='start'
                        color='inherit'
                        sx={{ mx: 1.5 }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Collapse>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Typography
                        variant='h6'
                        noWrap
                        component='div'
                        sx={{ ml: 1.5 }}
                    >
                        Credentials
                    </Typography>
                    {
                        <Tooltip title='Create New'>
                            <IconButton
                                size='large'
                                aria-label='account of current user'
                                aria-controls='menu-appbar'
                                aria-haspopup='true'
                                edge='end'
                                onClick={onCreateClick}
                                color='inherit'
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    }
                </Box>
            </Toolbar>
        </AppBar>
    );
}
