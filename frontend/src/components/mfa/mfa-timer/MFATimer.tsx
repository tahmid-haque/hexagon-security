import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

/**
 * MFATimer component used to show the time remaining on an MFA token
 * @returns a MFATimer component
 */
export default function MFATimer() {
    const [ticks, setTicks] = useState(0);
    const [isMounted, setIsMounted] = useState(true);

    // update the time left every second
    const refreshTicks = () => {
        if (!isMounted) return;
        setTicks(60 - new Date().getSeconds());
        setTimeout(refreshTicks, 1000 - new Date().getMilliseconds());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(refreshTicks, []);
    useEffect(() => () => setIsMounted(false), []);

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
            }}
        >
            <CircularProgress // taken from https://mui.com/api/circular-progress/#main-content
                variant='determinate'
                value={(ticks * 100) / 60}
                size={36}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant='subtitle1'
                    component='div'
                    color='text.primary'
                    sx={{ cursor: 'default', fontWeight: 'bold' }}
                >
                    {ticks}
                </Typography>
            </Box>
        </Box>
    );
}
