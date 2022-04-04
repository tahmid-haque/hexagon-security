import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
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
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import AppTable from '../shared/AppTable';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import OwnershipStatus from '../shared/OwnershipStatus';
import { Owner, PendingShare } from '../shares/ShareManager';
import ActionMenu from './action-menu/ActionMenu';
import CredentialEditor from './credential-editor/CredentialEditor';
import CredentialName from './name-field/CredentialName';
import CredentialPassword from './password-field/CredentialPassword';
import CredentialUser from './user-field/CredentialUser';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';

export type Credential = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: string;
    strength: CredentialStrength;
    shares: Owner[];
    pendingShares: PendingShare[];
};

export enum CredentialStrength {
    BREACHED = 'Potentially Breached Password',
    WEAK = 'Weak Password',
    MODERATE = 'Moderately Secure Password',
    STRONG = 'Secure Password',
    UNKNOWN = 'Security Unknown',
}

const loadErrorText = 'Unable to load credentials. Please try again later.';

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
        field: 'strength',
        headerName: 'Security',
        width: 71,
        sortable: false,
        filterable: false,
        renderCell: ({ value }) => {
            let icon: ReactElement<any, any>;

            switch (value) {
                case CredentialStrength.STRONG:
                    icon = <GppGoodIcon color='success' />;
                    break;

                case CredentialStrength.MODERATE:
                    icon = <GppGoodOutlinedIcon color='success' />;
                    break;

                case CredentialStrength.WEAK:
                    icon = <GppBadIcon color='warning' />;
                    break;

                case CredentialStrength.BREACHED:
                    icon = <GppMaybeIcon color='error' />;
                    break;

                case CredentialStrength.UNKNOWN:
                    icon = <GppMaybeIcon color='warning' />;
                    break;

                default:
                    break;
            }

            return (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Tooltip arrow title={value}>
                        {icon!}
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
                        ...(!isCredentialValid(params.row) && {
                            edit: true,
                            share: true,
                        }),
                    }}
                />
            );
        },
    },
];

const isCredentialValid = (credential: Credential) =>
    credential.user && credential.password && credential.key;

const updateCredentials = async function (
    this: CredentialsViewContext,
    offset: number,
    limit: number,
    sortType: GridSortDirection
) {
    const { update, state, dispatch } = this;

    update({ isLoading: true });
    try {
        const credentials = await state.credentialService.getCredentials(
            offset,
            limit,
            sortType
        );
        credentials.forEach((credential) => {
            if (!isCredentialValid(credential))
                dispatch(
                    sendToast({
                        message: `There were errors in loading a credential for ${credential.name}`,
                        severity: 'error',
                    })
                );
        });
        update({ credentials });
    } catch (error) {
        update({ tableErrorText: loadErrorText });
    }

    update({ isLoading: false });
};

const rerenderView = function (this: CredentialsViewContext) {
    this.dispatch(
        createEvent({
            type: DashboardEventType.RERENDER_DATA,
        })
    );
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
        update({ isDeleteOpen: false });
        rerenderView.call(this);
    } catch (error) {
        dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to delete your credential. Please try again later.',
                severity: 'error',
            })
        );
    }
    update({ isDeleteLoading: false });
};

const updateCount = function (this: CredentialsViewContext) {
    const { state, update } = this;
    state.credentialService
        .getCredentialCount()
        .then((totalCredentials) => {
            update({
                totalCredentials,
                ...(!totalCredentials && { isLoading: false }),
            });
        })
        .catch(() => update({ tableErrorText: loadErrorText }));
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

        case DashboardEventType.RERENDER_DATA:
            updateCount.call(this);
            break;

        default:
            break;
    }
};

const init = function (this: CredentialsViewContext) {
    this.dispatch(setDisplay(Display.CREDENTIALS));
    updateCount.call(this);
};

type CredentialsViewState = {
    credentials: Credential[];
    totalCredentials: number;
    isLoading: boolean;
    isEditorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    credentialService: CredentialService;
    tableErrorText: string;
    currentId?: string;
    currentCredential?: Credential;
    isEdit?: boolean;
};

type CredentialsViewContext = {
    state: CredentialsViewState;
    event: DashboardEvent;
    update: (update: Partial<CredentialsViewState>) => void;
    dispatch: any;
};

export default function CredentialsView() {
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;

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
        tableErrorText: '',
        credentialService: new CredentialService(
            cryptoWorker,
            account,
            apolloClient
        ),
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
                errorText={state.tableErrorText}
                isLoading={state.isLoading}
                sortField='name'
                updateContent={updateCredentials.bind(context)}
            />
            <CredentialEditor
                isOpen={state.isEditorOpen}
                isEdit={state.isEdit!}
                onClose={(modified) => {
                    update({
                        isEditorOpen: false,
                        ...(modified && { rerenderTable: true }),
                    });
                    if (modified) rerenderView.call(context);
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
