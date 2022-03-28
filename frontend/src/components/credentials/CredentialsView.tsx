import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Box, Button, LinearProgress, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { RefObject, useEffect, useRef, useState } from 'react';
import { setDisplay, Display } from '../../store/slices/DisplaySlice';
import { useOutletContext } from 'react-router-dom';
import CredentialService from '../../services/CredentialService';
import {
    clearEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import AppModal from '../shared/AppModal';
import ActionMenu from './action-menu/ActionMenu';
import CredentialEditor from './credential-editor/CredentialEditor';
import CredentialName from './name-field/CredentialName';
import CredentialPassword from './password-field/CredentialPassword';
import CredentialUser from './user-field/CredentialUser';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { sendToast } from '../../store/slices/ToastSlice';

export type Credentials = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: ArrayBuffer;
    shares: string[];
};

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 300,
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
        flex: 3,
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

type CredentialsViewState = {
    credentials: Credentials[];
    numRows: number;
    currentPage: number;
    totalCredentials: number;
    isLoading: boolean;
    sortType: GridSortDirection;
    isEditorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    currentId?: string;
    isEdit?: boolean;
};

export default function CredentialsView() {
    const ref = useRef(null) as RefObject<HTMLDivElement>;
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();
    const [credentialService] = useState<CredentialService>(
        new CredentialService(cryptoWorker, account)
    );

    const [state, setState] = useState({
        credentials: [],
        numRows: 0,
        currentPage: 0,
        isEditorOpen: false,
        isDeleteOpen: false,
        isLoading: true,
        totalCredentials: 0,
        isDeleteLoading: false,
        sortType: 'asc',
    } as CredentialsViewState);

    const update = (update: Partial<CredentialsViewState>) => {
        setState((state) => {
            return { ...state, ...update };
        });
    };

    const updateCredentials = async () => {
        update({ isLoading: true });
        update({
            credentials: await credentialService.getCredentials(
                state.currentPage * state.numRows,
                state.numRows,
                state.sortType
            ),
        });
        update({ isLoading: false });
    };

    useEffect(() => {
        dispatch(setDisplay(Display.CREDENTIALS));
        const updateNumRows = () => {
            const numRows = Math.floor((ref.current!.clientHeight - 110) / 52);
            if (numRows !== state.numRows) {
                update({
                    numRows,
                });
            }
        };
        window.addEventListener('resize', updateNumRows);
        credentialService.getCredentialCount().then((totalCredentials) => {
            update({ totalCredentials });
            updateNumRows();
        });
    }, []);

    useEffect(() => {
        if (state.totalCredentials && state.numRows) updateCredentials();
    }, [
        state.numRows,
        state.sortType,
        state.totalCredentials,
        state.currentPage,
    ]);

    useEffect(() => {
        switch (event.type) {
            case DashboardEventType.CREATE_CLICK:
                update({ isEditorOpen: true, isEdit: false });
                dispatch(clearEvent());
                break;

            case DashboardEventType.DELETE_CLICK:
                update({
                    isDeleteOpen: true,
                    currentId: event.param,
                });
                dispatch(clearEvent());
                break;

            case DashboardEventType.EDIT_CLICK:
                update({
                    isEditorOpen: true,
                    currentId: event.param,
                    isEdit: true,
                });
                dispatch(clearEvent());
                break;

            default:
                break;
        }
    }, [event]);

    const onDeleteAccept = async () => {
        update({ isDeleteLoading: true });
        try {
            await credentialService.deleteCredential(state.currentId!);
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

    const [editorCredential] = state.credentials.filter(
        (c) => c.id === state.currentId
    );

    return (
        <Box ref={ref} sx={{ height: '100%', width: 'calc(100vw - 66px)' }}>
            <DataGrid
                disableColumnMenu
                disableSelectionOnClick
                paginationMode='server'
                loading={state.isLoading}
                components={{
                    LoadingOverlay: LinearProgress,
                    NoRowsOverlay: () => (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                            }}
                        >
                            No credentials found.
                        </Box>
                    ),
                }}
                rowCount={state.totalCredentials}
                rows={state.credentials}
                columns={columns}
                pageSize={state.numRows}
                rowsPerPageOptions={[state.numRows]}
                onPageChange={(currentPage) => update({ currentPage })}
                sortModel={[{ field: 'name', sort: state.sortType }]}
                onSortModelChange={(model) => {
                    const sortType = model.length ? model[0].sort : 'asc';
                    update({ sortType });
                }}
                sx={{
                    mx: 0,
                    // remove focus outlinees
                    '&.MuiDataGrid-root .MuiDataGrid-cell, &.MuiDataGrid-root .MuiDataGrid-columnHeader':
                        {
                            outline: 'none',
                        },
                }}
            />
            <CredentialEditor
                isOpen={state.isEditorOpen}
                isEdit={state.isEdit!}
                onClose={(modified) => {
                    update({ isEditorOpen: false });
                    if (modified) updateCredentials();
                }}
                credentialService={credentialService}
                credential={state.isEdit ? editorCredential : undefined}
            />
            <ConfirmationDialog
                isOpen={state.isDeleteOpen}
                onClose={() => update({ isDeleteOpen: false })}
                onAccept={onDeleteAccept}
                title='Delete Credential'
                body='Are you sure you want to delete this credential? This action cannot be undone.'
                isLoading={state.isDeleteLoading}
            />
        </Box>
    );
}
