import { Box, Button, CircularProgress, TextField } from "@mui/material";
import React, { useEffect } from "react";
import NoteService from "../../../services/NoteService";
import { sendToast } from "../../../store/slices/ToastSlice";
import { useAppDispatch } from "../../../store/store";
import { useComponentState } from "../../../utils/hooks";
import AppModal from "../../shared/AppModal";
import { Note } from "../NotesView";

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
    titleError: "",
    title: "",
    body: "",
    isLoading: false,
};

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

const onTitleChange = (
    update: (update: Partial<NoteEditorState>) => void,
    event: React.ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;
    update({
        title: value,
        isTitleValid: value.length > 0,
        titleError: "",
    });
};

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

const onCreateSubmit = async (
    state: NoteEditorState,
    update: (update: Partial<NoteEditorState>) => void,
    props: NoteEditorProps,
    dispatch: any
) => {
    if (!state.title) {
        return update({
            titleError: "Please enter a title",
            isTitleValid: false,
        });
    }
    update({ isLoading: true });
    try {
        await props.noteService.createNote(state.title, state.body);
        dispatch(
            sendToast({
                message: "Successfully created your note.",
                severity: "success",
            })
        );
    } catch (error) {
        update({ isLoading: false });
        return dispatch(
            sendToast({
                message:
                    "Something went wrong and we were unable to save your note. Try again later.",
                severity: "error",
            })
        );
    }
    update({ isLoading: false });
    onClose(state, update, props.onClose, true);
};

const onEditSubmit = async (
    state: NoteEditorState,
    update: (update: Partial<NoteEditorState>) => void,
    props: NoteEditorProps,
    dispatch: any
) => {
    if (!state.title) {
        return update({
            titleError: "Please enter a title",
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
                message: "Successfully updated your note.",
                severity: "success",
            })
        );
    } catch (error) {
        update({ isLoading: false });
        return dispatch(
            sendToast({
                message:
                    "Something went wrong and we were unable to save your note. Try again later.",
                severity: "error",
            })
        );
    }
    update({ isLoading: false });
    onClose(state, update, props.onClose, true);
};

export default function NoteEditor(props: NoteEditorProps) {
    const { state, update } = useComponentState(initState);
    const dispatch = useAppDispatch();

    useEffect(onNoteChange.bind(null, props, update), [
        props.note,
        props.isOpen,
    ]);

    return (
        <AppModal
            isOpen={props.isOpen}
            modalTitle={`${props.isEdit ? "Edit" : "Create"} Note`}
            onClose={onClose.bind(null, state, update, props.onClose, false)}
        >
            <TextField
                fullWidth
                error={!state.isTitleValid}
                label="Title"
                value={state.title}
                type="text"
                helperText={state.titleError ?? ""}
                variant="standard"
                onChange={onTitleChange.bind(null, update)}
            />
            <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                label="Body"
                value={state.body}
                type="text"
                variant="standard"
                onChange={(event) =>
                    update({
                        body: event.target.value,
                    })
                }
                sx={{ my: 1 }}
            />
            <Box sx={{ float: "right", mt: 2, position: "relative" }}>
                <Button
                    variant="contained"
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
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
                        }}
                    />
                )}
            </Box>
        </AppModal>
    );
}
