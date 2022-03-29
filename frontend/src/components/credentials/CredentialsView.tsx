import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Box, Tooltip } from '@mui/material';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import CredentialService from '../../services/CredentialService';
import {
    clearEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import AppTable from '../shared/AppTable';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import ActionMenu from './action-menu/ActionMenu';
import CredentialEditor from './credential-editor/CredentialEditor';
import CredentialName from './name-field/CredentialName';
import CredentialPassword from './password-field/CredentialPassword';
import CredentialUser from './user-field/CredentialUser';

export type Credentials = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: ArrayBuffer;
    shares: string[];
};

const columnDef: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 300,
        flex: 1.5,
        sortable: true,
        hideable: false,
        renderCell: (params) => {
            return <CredentialName name={params.value} />;
        },
    },
    {
        field: 'user',
        flex: 1.5,
        headerName: 'User',
        hideable: false,
        sortable: false,
        width: 200,
        renderCell: (params) => {
            return <CredentialUser user={params.value} />;
        },
    },
    {
        field: 'password',
        headerName: 'Password',
        width: 200,
        sortable: false,
        filterable: false,
        hideable: false,
        flex: 1.5,
        renderCell: (params) => {
            return <CredentialPassword password={params.value} />;
        },
    },
    {
        field: 'security',
        headerName: 'Security',
        width: 71,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Tooltip title='Secure'>
                        <VerifiedUserIcon color='success' />
                    </Tooltip>
                </Box>
            );
        },
    },
    {
        field: 'ownership',
        headerName: 'Ownership',
        width: 88,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Tooltip title='Exclusive'>
                        <LockIcon />
                    </Tooltip>
                </Box>
            );
        },
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 67,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return <ActionMenu id={params.row.id} />;
        },
    },
];

const updateCredentials = async function (
    this: CredentialsViewContext,
    offset: number,
    limit: number,
    sortType: GridSortDirection
) {
    const { update, state } = this;
    update({ isLoading: true });
    update({
        credentials: await state.credentialService.getCredentials(
            offset,
            limit,
            sortType
        ),
    });
    update({ isLoading: false });
};

const onDeleteAccept = async function (this: CredentialsViewContext) {
    const { update, state, dispatch } = this;
    update({ isDeleteLoading: true });
    try {
        await state.credentialService.deleteCredential(state.currentId!);
        dispatch(
            sendToast({
                message: 'Successfully deleted your credential.',
                severity: 'success',
            })
        );
    } catch (error) {
        dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to delete your credential. Please try again later.',
                severity: 'error',
            })
        );
    }
    update({ isDeleteLoading: false, isDeleteOpen: false });
};

const handleEvent = function (this: CredentialsViewContext) {
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
            const [currentCredential] = state.credentials.filter(
                (c) => c.id === event.param
            );
            update({
                isEditorOpen: true,
                isEdit: true,
                currentCredential,
            });
            break;

        default:
            break;
    }
};

const init = function (this: CredentialsViewContext) {
    const { state, update, dispatch } = this;
    dispatch(setDisplay(Display.CREDENTIALS));
    state.credentialService.getCredentialCount().then((totalCredentials) => {
        update({ totalCredentials });
    });
};

type CredentialsViewState = {
    credentials: Credentials[];
    totalCredentials: number;
    isLoading: boolean;
    isEditorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    rerenderTable: boolean;
    credentialService: CredentialService;
    currentId?: string;
    currentCredential?: Credentials;
    isEdit?: boolean;
};

type CredentialsViewContext = {
    state: CredentialsViewState;
    event: {
        type: DashboardEventType;
        param: string;
    };
    update: (update: Partial<CredentialsViewState>) => void;
    dispatch: any;
};

export default function CredentialsView() {
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();

    const { state, update } = useComponentState({
        credentials: [],
        numRows: 0,
        currentPage: 0,
        isEditorOpen: false,
        isDeleteOpen: false,
        isLoading: true,
        totalCredentials: 0,
        isDeleteLoading: false,
        sortType: 'asc',
        rerenderTable: false,
        credentialService: new CredentialService(cryptoWorker, account),
    } as CredentialsViewState);

    const context = { state, event, update, dispatch };
    useEffect(init.bind(context), []);
    useEffect(handleEvent.bind(context), [event]);

    return (
        <Box sx={{ height: '100%' }}>
            <AppTable
                columnDef={columnDef}
                content={state.credentials}
                contentCount={state.totalCredentials}
                isLoading={state.isLoading}
                sortField='name'
                updateContent={updateCredentials.bind(context)}
                rerender={state.rerenderTable}
                clearRerender={() => update({ rerenderTable: false })}
            />
            <CredentialEditor
                isOpen={state.isEditorOpen}
                isEdit={state.isEdit!}
                onClose={(modified) => {
                    update({
                        isEditorOpen: false,
                        ...(modified && { rerenderTable: true }),
                    });
                }}
                credentialService={state.credentialService}
                credential={state.currentCredential}
            />
            <ConfirmationDialog
                isOpen={state.isDeleteOpen}
                onClose={() => update({ isDeleteOpen: false })}
                onAccept={onDeleteAccept.bind(context)}
                title='Delete Credential'
                body='Are you sure you want to delete this credential? This action cannot be undone.'
                isLoading={state.isDeleteLoading}
            />
        </Box>
    );
}
