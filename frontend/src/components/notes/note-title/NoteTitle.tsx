import { Box, Tooltip } from '@mui/material';
import React from 'react';
import {
    createEvent,
    DashboardEventType,
} from '../../../store/slices/DashboardSlice';
import { useAppDispatch } from '../../../store/store';

/**
 * NoteTitle component used to display the title of a note
 * @param props contains the title and id of the note to display
 * @returns a NoteTitle component
 */
export default function NoteTitle(props: { title: string; id: string }) {
    const dispatch = useAppDispatch();
    return (
        <Tooltip arrow title='Double click to view'>
            <Box
                // dispatch edit events on double click
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
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontStyle: 'italic',
                        fontSize: '15px',
                    }}
                >
                    {props.title}
                </Box>
            </Box>
        </Tooltip>
    );
}
