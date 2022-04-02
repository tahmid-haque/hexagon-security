import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import LockIcon from '@mui/icons-material/Lock';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { Box, Tooltip } from '@mui/material';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { ReactElement, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import CredentialService from '../../services/CredentialService';
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
import AppTable from '../shared/AppTable';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import ActionMenu from '../credentials/action-menu/ActionMenu';
import NoteService from '../../services/NoteService';
import NoteEditor from './note-editor/NoteEditor';
import NoteTitle from './note-title/NoteTitle';
import { Owner, PendingShare } from '../shares/ShareManager';
import OwnershipStatus from '../shared/OwnershipStatus';

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

const isNoteValid = (note: Note) => note.title && note.lastModified && note.key;

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

const rerenderView = function (this: NotesViewContext) {
    this.dispatch(
        createEvent({
            type: DashboardEventType.RERENDER_DATA,
        })
    );
};

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

        default:
            break;
    }
};

const init = function (this: NotesViewContext) {
    const { state, update, dispatch } = this;
    dispatch(setDisplay(Display.NOTES));
    state.noteService
        .getNoteCount()
        .then((totalCredentials) => {
            update({ totalNotes: totalCredentials });
        })
        .catch(() => update({ tableErrorText: loadErrorText }));
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
    useEffect(init.bind(context), []);
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
