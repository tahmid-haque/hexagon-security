import { Box, styled } from '@mui/material';
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import DashboardHeader from './dashboard-header/DashboardHeader';
import DashboardNavigation from './dashboard-navigation/DashboardNavigation';

// Note: much of the dashboard header and navigation components are designed based on the MUI example here - https://mui.com/material-ui/react-drawer/

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

type DashboardState = {
    isNavOpen: boolean;
    isDashShown: boolean;
};

export default function Dashboard() {
    const account = useAppSelector((state) => state.account);
    const [state, setState] = React.useState({
        isNavOpen: false,
        isDashShown: false,
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

    useEffect(() => {
        setTimeout(() => {
            update({ isDashShown: true });
        }, 1);
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <DashboardHeader
                isNavOpen={state.isNavOpen}
                onNavOpen={onNavOpen}
                isShown={state.isDashShown}
            ></DashboardHeader>
            <DashboardNavigation
                isNavOpen={state.isNavOpen}
                isShown={state.isDashShown}
                onNavClose={onNavClose}
                email={account.email}
            ></DashboardNavigation>
            <Box sx={{ width: '100%', height: '100vh', overflowY: 'auto' }}>
                <Offset />
                <Outlet context={{ account }} />
            </Box>
        </Box>
    );
}
