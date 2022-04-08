import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Collapse, styled, Tooltip, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import { navWidth } from '../../../shared/constants';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';
import { Display } from '../../../store/slices/DisplaySlice';
import { useAppDispatch } from '../../../store/store';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

// create a custom styled header based on the MuiAppBar
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
    currentPane: string;
};

/**
 * DashboardHeader component used to display the current view information and create options
 * @param props props used to configure the DashboardHeader
 * @returns a DashboardHeader component
 */
export default function DashboardHeader(props: DashboardHeaderProps) {
    const dispatch = useAppDispatch();

    // dispatch the create event
    const onCreateClick = () => {
        dispatch(createEvent({ type: DashboardEventType.CREATE_CLICK }));
    };

    return (
        <AppBar
            position='fixed'
            open={props.isNavOpen}
            sx={{
                transform: `translateY(${props.isShown ? 0 : -290}px)`,
                p: 0,
            }}
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
                        {props.currentPane}
                    </Typography>
                    {props.currentPane !== Display.NONE && (
                        <Tooltip arrow title='Create New'>
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
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
