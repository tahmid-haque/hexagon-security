import { Box, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import React from 'react';

/**
 * CredentialName componenet used to show the URL and logo
 * @param props contains the URL shown by CredentialName
 * @returns a CredentialName component
 */
export default function CredentialName(props: { name: string }) {
    // launch the URL on double click
    const onDoubleClick = () => {
        // taken from https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window
        window.open(`https://${props.name}`, '_blank')?.focus();
    };

    return (
        <Tooltip arrow title={props.name ? 'Double click to launch' : ''}>
            <Box
                sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                onDoubleClick={onDoubleClick}
            >
                <Avatar
                    sx={{ bgcolor: 'none' }}
                    variant='rounded'
                    src={`https://logo.clearbit.com/${props.name}`}
                    alt={props.name.toUpperCase()}
                ></Avatar>
                <Box
                    sx={{
                        ml: 1.5,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {props.name.toLowerCase()}
                </Box>
            </Box>
        </Tooltip>
    );
}
