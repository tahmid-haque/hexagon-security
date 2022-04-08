import { Box, Button, CircularProgress, TextField } from '@mui/material';
import React, { useEffect } from 'react';
import NoteService from '../../../services/NoteService';
import { sendToast } from '../../../store/slices/ToastSlice';
import { useAppDispatch } from '../../../store/store';
import { useComponentState } from '../../../utils/hooks';
import AppModal from '../../shared/AppModal';
import { Note } from '../NotesView';

export type NoteEditorProps = {
    isOpen: boolean;
    onClose: (modified?: boolean) => void;
    noteService: NoteService;
    isEdit: boolean;
    note?: Note;
};

type NoteEditorState = {
    isTitleValid: boolean;
    titleError: string;
    title: string;
    body: string;
    isLoading: boolean;
};

const initState: NoteEditorState = {
    isTitleValid: true,
    titleError: '',
    title: '',
    body: '',
    isLoading: false,
};

/**
 * Initialize the editor with the new note passed from the props
 * @param props the props passed to the NoteEditor
 * @param update function used to update the state
 */
const onNoteChange = (
    props: NoteEditorProps,
    update: (update: Partial<NoteEditorState>) => void
) => {
    if (props.isEdit && props.isOpen) {
        update({
            title: props.note!.title,
            body: props.note!.body,
        });
    }
};

/**
 * Event handler to handle title field changes. Determine whether the title is valid and update the page.
 * @param update function used to update the state
 * @param event a ChangeEvent
 */
const onTitleChange = (
    update: (update: Partial<NoteEditorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        title: value,
        isTitleValid: value.length > 0,
        titleError: '',
    });
};

/**
 * Event handler to handle close events
 * @param state the current state of the NoteEditor
 * @param update function used to update the state
 * @param close callback to call on close with the modification update
 * @param modified whether a note was updated/created
 */
const onClose = (
    state: NoteEditorState,
    update: (update: Partial<NoteEditorState>) => void,
    close: (modified: boolean) => void,
    modified: boolean
) => {
    if (state.isLoading) return;
    update(initState);
    close(modified);
};

/**
 * Event handler for handling note creation by calling the server.
 * @param state the current state of the NoteEditor
 * @param update function used to update the state
 * @param props the props passed to the NoteEditor
 * @param dispatch function used to dispatch redux actions
 */
const onCreateSubmit = async (
    state: NoteEditorState,
    update: (update: Partial<NoteEditorState>) => void,
    props: NoteEditorProps,
    dispatch: any
) => {
    if (!state.title) {
        return update({
            titleError: 'Please enter a title',
            isTitleValid: false,
        });
    }
    update({ isLoading: true });
    try {
        await props.noteService.createNote(state.title, state.body);
        dispatch(
            sendToast({
                message: 'Successfully created your note.',
                severity: 'success',
            })
        );
    } catch (error) {
        update({ isLoading: false });
        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to save your note. Try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false });
    onClose(state, update, props.onClose, true);
};

/**
 * Event handler for handling note update. Updates the note on the server.
 * @param state the current state of the NoteEditor
 * @param update function used to update the state
 * @param props the props passed to the NoteEditor
 * @param dispatch function used to dispatch redux actions
 */
const onEditSubmit = async (
    state: NoteEditorState,
    update: (update: Partial<NoteEditorState>) => void,
    props: NoteEditorProps,
    dispatch: any
) => {
    if (!state.title) {
        return update({
            titleError: 'Please enter a title',
            isTitleValid: false,
        });
    }
    update({ isLoading: true });
    try {
        await props.noteService.updateNote(
            props.note!.id,
            state.title,
            state.body,
            props.note!.key
        );
        dispatch(
            sendToast({
                message: 'Successfully updated your note.',
                severity: 'success',
            })
        );
    } catch (error) {
        update({ isLoading: false });
        return dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to save your note. Try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false });
    onClose(state, update, props.onClose, true);
};

/**
 * NoteEditor component used to edit/create notes
 * @param props props used to configure the NoteEditor
 * @returns a NoteEditor component
 */
export default function NoteEditor(props: NoteEditorProps) {
    const { state, update } = useComponentState(initState);
    const dispatch = useAppDispatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(onNoteChange.bind(null, props, update), [
        props.note,
        props.isOpen,
    ]);

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={`${props.isEdit ? 'Edit' : 'Create'} Note`}
            onClose={onClose.bind(null, state, update, props.onClose, false)}
        >
            <TextField
                fullWidth
                error={!state.isTitleValid}
                label='Title'
                value={state.title}
                type='text'
                helperText={state.titleError ?? ''}
                variant='standard'
                onChange={onTitleChange.bind(null, update)}
            />
            <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                label='Body'
                value={state.body}
                type='text'
                variant='standard'
                onChange={(event) =>
                    update({
                        body: event.target.value,
                    })
                }
                sx={{ my: 1 }}
            />
            <Box sx={{ float: 'right', mt: 2, position: 'relative' }}>
                <Button
                    variant='contained'
                    onClick={() =>
                        props.isEdit
                            ? onEditSubmit(state, update, props, dispatch)
                            : onCreateSubmit(state, update, props, dispatch)
                    }
                    disabled={state.isLoading}
                >
                    Save
                </Button>
                {state.isLoading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>
        </AppModal>
    );
}
