import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function MFATimer(props: any) {
    const [ticks, setTicks] = useState(0);

    const updateTicks = () => setTicks(60 - new Date().getSeconds());

    useEffect(() => {
        const refreshTicks = () => {
            updateTicks();
            setTimeout(refreshTicks, 1000);
        };
        refreshTicks();
    }, []);
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                height: 48,
                mt: 1,
            }}
        >
            <CircularProgress // taken from https://mui.com/api/circular-progress/#main-content
                variant='determinate'
                value={(ticks * 100) / 60}
                size={48}
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
