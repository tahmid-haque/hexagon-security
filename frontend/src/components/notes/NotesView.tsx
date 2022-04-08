import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import { Box } from '@mui/material';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import NoteService from '../../services/NoteService';
import {
    clearEvent,
    createEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import ActionMenu from '../credentials/action-menu/ActionMenu';
import AppTable from '../shared/AppTable';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import OwnershipStatus from '../shared/OwnershipStatus';
import { Owner, PendingShare } from '../shares/ShareManager';
import NoteEditor from './note-editor/NoteEditor';
import NoteTitle from './note-title/NoteTitle';

export type Note = {
    id: string;
    lastModified: Date | undefined;
    title: string;
    body: string;
    key: string;
    shares: Owner[];
    pendingShares: PendingShare[];
};

const loadErrorText = 'Unable to load notes. Please try again later.';

const dateFormat: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

// MUI Data Grid cofiguration
const columnDef: GridColDef[] = [
    {
        field: 'title',
        headerName: 'Title',
        width: 500,
        flex: 2,
        sortable: false,
        hideable: false,
        renderCell: ({ row: { title, id } }) => (
            <NoteTitle id={id} title={title} />
        ),
    },
    {
        field: 'lastModified',
        headerName: 'Last Modified',
        hideable: false,
        sortable: true,
        width: 250,
        valueFormatter: ({ value }) =>
            new Date(value as Date).toLocaleDateString('en-US', dateFormat),
    },
    {
        field: 'ownership',
        headerName: 'Ownership',
        width: 88,
        sortable: false,
        filterable: false,
        renderCell: (params) => <OwnershipStatus data={params.row} />,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 67,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return (
                <ActionMenu
                    data={params.row}
                    hideOptions={{
                        ...(!isNoteValid(params.row) && {
                            edit: true,
                            share: true,
                        }),
                    }}
                />
            );
        },
    },
];

/**
 * Determine whether a note has valid data
 * @param note the note to validate
 * @returns true if the note is valid, false otherwise
 */
const isNoteValid = (note: Note) => note.title && note.lastModified && note.key;

/**
 * Update the current notes with new ones based on the requested attributes.
 * @param this context in which to execute the function
 * @param offset the start position of the requested notes
 * @param limit the number of notes requested
 * @param sortType the sort direction
 */
const updateNotes = async function (
    this: NotesViewContext,
    offset: number,
    limit: number,
    sortType: GridSortDirection
) {
    const { update, state, dispatch } = this;
    update({ isLoading: true });
    try {
        const notes = await state.noteService.getNotes(offset, limit, sortType);
        for (const note of notes) {
            if (!isNoteValid(note)) {
                dispatch(
                    sendToast({
                        message: `There were errors in loading note(s)`,
                        severity: 'error',
                    })
                );
                break;
            }
        }
        update({ notes });
    } catch (error) {
        update({ tableErrorText: loadErrorText });
    }

    update({ isLoading: false });
};

/**
 * Rerender the app table by obtaining fresh data
 * @param this context in which to execute the function
 */
const rerenderView = function (this: NotesViewContext) {
    this.dispatch(
        createEvent({
            type: DashboardEventType.RERENDER_DATA,
        })
    );
};

/**
 * Delete the current note from the user's profile
 * @param this context in which to execute the function
 */
const onDeleteAccept = async function (this: NotesViewContext) {
    const { update, state, dispatch } = this;
    update({ isDeleteLoading: true });
    try {
        await state.noteService.deleteNote(state.currentId!);
        dispatch(
            sendToast({
                message: 'Successfully deleted your note.',
                severity: 'success',
            })
        );
        update({ isDeleteOpen: false });
        rerenderView.call(this);
    } catch (error) {
        dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to delete your note. Please try again later.',
                severity: 'error',
            })
        );
    }
    update({ isDeleteLoading: false });
};

/**
 * Update the page to reflect the latest count
 * @param this context in which to execute the function
 */
const updateCount = function (this: NotesViewContext) {
    const { state, update } = this;
    state.noteService
        .getNoteCount()
        .then((totalNotes) => {
            update({
                totalNotes,
                ...(!totalNotes && { isLoading: false }),
            });
        })
        .catch(() => update({ tableErrorText: loadErrorText }));
};

/**
 * Handle dashboard events dispatched by Redux
 * @param this context in which to execute the function
 */
const handleEvent = function (this: NotesViewContext) {
    const { event, update, dispatch, state } = this;
    switch (event.type) {
        case DashboardEventType.CREATE_CLICK:
            dispatch(clearEvent());
            update({ isEditorOpen: true, isEdit: false });
            break;

        case DashboardEventType.DELETE_CLICK:
            dispatch(clearEvent());
            update({
                isDeleteOpen: true,
                currentId: event.param,
            });
            break;

        case DashboardEventType.EDIT_CLICK:
            dispatch(clearEvent());
            const [currentCredential] = state.notes.filter(
                (c) => c.id === event.param
            );
            update({
                isEditorOpen: true,
                isEdit: true,
                currentNote: currentCredential,
            });
            break;

        case DashboardEventType.RERENDER_DATA:
            updateCount.call(this);
            break;

        default:
            break;
    }
};

/**
 * Update the dashboard periphery to reflect the current view
 * @param this context in which to execute the function
 */
const init = function (this: NotesViewContext) {
    this.dispatch(setDisplay(Display.NOTES));
    updateCount.call(this);
};

type NotesViewState = {
    notes: Note[];
    totalNotes: number;
    isLoading: boolean;
    isEditorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    noteService: NoteService;
    tableErrorText: string;
    currentId?: string;
    currentNote?: Note;
    isEdit?: boolean;
};

type NotesViewContext = {
    state: NotesViewState;
    event: DashboardEvent;
    update: (update: Partial<NotesViewState>) => void;
    dispatch: any;
};

/**
 * NotesView component used to view and manage notes
 * @returns a NotesView component
 */
export default function NotesView() {
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;

    const { state, update } = useComponentState({
        notes: [],
        numRows: 0,
        currentPage: 0,
        isEditorOpen: false,
        isDeleteOpen: false,
        isLoading: true,
        totalNotes: 0,
        isDeleteLoading: false,
        tableErrorText: '',
        sortType: 'asc',
        noteService: new NoteService(cryptoWorker, account, apolloClient),
    } as NotesViewState);

    const context = { state, event, update, dispatch };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(init.bind(context), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(handleEvent.bind(context), [event]);

    return (
        <Box sx={{ height: '100%' }}>
            <AppTable
                errorText={state.tableErrorText}
                columnDef={columnDef}
                content={state.notes}
                contentCount={state.totalNotes}
                isLoading={state.isLoading}
                sortField='lastModified'
                updateContent={updateNotes.bind(context)}
                initialSort='desc'
            />
            <NoteEditor
                isOpen={state.isEditorOpen}
                isEdit={state.isEdit!}
                onClose={(modified) => {
                    update({
                        isEditorOpen: false,
                    });
                    if (modified) rerenderView.call(context);
                }}
                noteService={state.noteService}
                note={state.currentNote}
            />
            <ConfirmationDialog
                isOpen={state.isDeleteOpen}
                onClose={() => update({ isDeleteOpen: false })}
                onAccept={onDeleteAccept.bind(context)}
                title='Delete Note'
                body='Are you sure you want to delete this note? This action cannot be undone.'
                isLoading={state.isDeleteLoading}
            />
        </Box>
    );
}
