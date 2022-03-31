import { Box, Tooltip } from '@mui/material';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';
import { useAppDispatch } from '../../../store/store';

export default function NoteTitle(props: { title: string; id: string }) {
    const dispatch = useAppDispatch();
    return (
        <Tooltip arrow title='Double click to view'>
            <Box
                onDoubleClick={() =>
                    dispatch(
                        createEvent({
                            type: DashboardEventType.EDIT_CLICK,
                            param: props.id,
                        })
                    )
                }
                sx={{
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {props.title}
            </Box>
        </Tooltip>
    );
}
