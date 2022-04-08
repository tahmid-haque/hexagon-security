import { Box, IconButton, Tooltip } from '@mui/material';
import { getShareInfo, ShareInfo } from '../shares/ShareManager';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import { useAppDispatch } from '../../store/store';
import {
    createEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { Credential } from '../credentials/CredentialsView';
import { MFA } from '../mfa/MFAView';
import { Note } from '../notes/NotesView';

/**
 * OwnershipStatus component used to display ownership of a credential / MFA credential / note
 * @param props contains the data to determine ownership of
 * @returns a OwnershipStatus component
 */
export default function OwnershipStatus(props: {
    data: Credential | MFA | Note;
}) {
    const dispatch = useAppDispatch();
    const isShared =
        props.data.shares.length + props.data.pendingShares.length > 1;
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Tooltip arrow title={isShared ? 'Shared' : 'Exclusive'}>
                {isShared ? (
                    <IconButton
                        onClick={() =>
                            dispatch(
                                createEvent({
                                    type: DashboardEventType.SHARE_CLICK,
                                    param: getShareInfo(props.data),
                                })
                            )
                        }
                    >
                        <PeopleIcon />
                    </IconButton>
                ) : (
                    <LockIcon />
                )}
            </Tooltip>
        </Box>
    );
}
