import { Box, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';

export default function CredentialName(props: { name: string }) {
    const onDoubleClick = () => {
        // taken from https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window
        window.open(`https://${props.name}`, '_blank')?.focus();
    };

    return (
        <Tooltip title='Double click to launch'>
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
                    }}
                >
                    {props.name.toLowerCase()}
                </Box>
            </Box>
        </Tooltip>
    );
}
