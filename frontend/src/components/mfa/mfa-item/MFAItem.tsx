import {
    Avatar,
    Box,
    CircularProgress,
    Grid,
    Tooltip,
    Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ActionMenu from '../../credentials/action-menu/ActionMenu';
import CredentialPassword from '../../credentials/password-field/CredentialPassword';
import MFATimer from './mfa-timer/MFATimer';
import { MFA } from '../MFAView';

export default function (props: { mfa: MFA }) {
    return (
        <Box
            sx={{
                borderRadius: '10px',
                background: 'rgba(255,255,255, 0.3)',
                boxShadow: 1,
                display: 'flex',
                justifyContent: 'space-between',
                height: 120,
                p: 1,
                overflow: 'hidden',
            }}
        >
            <Box>
                <Box sx={{ width: 64 }}>
                    <Avatar
                        sx={{ bgcolor: 'none', width: 64, height: 64 }}
                        variant='rounded'
                        src={`https://logo.clearbit.com/${props.mfa.name}`}
                        alt={props.mfa.name.toUpperCase()}
                    ></Avatar>
                    <MFATimer />
                </Box>
            </Box>
            <Box
                sx={{
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    width: 'calc(100%)',
                    px: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                }}
            >
                <Box>
                    <Typography
                        variant='h6'
                        fontWeight={'bold'}
                        sx={{
                            whiteSpace: 'noWrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {props.mfa.name}
                    </Typography>
                    <Typography
                        variant='h6'
                        sx={{
                            whiteSpace: 'noWrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {props.mfa.user}
                    </Typography>
                </Box>
                <CredentialPassword
                    password={'543832'}
                    shorten={2}
                    sx={{ letterSpacing: 3, fontSize: 24, p: 0 }}
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 0.2,
                }}
            >
                <Tooltip title='Exclusive'>
                    <LockIcon sx={{ fontSize: 28, pt: 0.5 }} />
                </Tooltip>
                <ActionMenu id={props.mfa.id} />
            </Box>
        </Box>
    );
}
