import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import { Box } from '@mui/material';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MFAService from '../../services/MFAService';
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
import CredentialName from '../credentials/name-field/CredentialName';
import CredentialUser from '../credentials/user-field/CredentialUser';
import AppTable from '../shared/AppTable';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import OwnershipStatus from '../shared/OwnershipStatus';
import { Owner, PendingShare } from '../shares/ShareManager';
import MFACode from './mfa-code/MFACode';
import MFACreator from './mfa-creator/MFACreator';
import MFATimer from './mfa-timer/MFATimer';

type MFAViewContext = {
    state: MFAViewState;
    event: DashboardEvent;
    update: (update: Partial<MFAViewState>) => void;
    dispatch: any;
};

type MFAViewState = {
    content: MFA[];
    totalMFAs: number;
    isLoading: boolean;
    isCreatorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    tableErrorText: string;
    mfaService: MFAService;
    currentId?: string;
};

export type MFA = {
    id: string;
    name: string;
    user: string;
    seed: string;
    key: string;
    shares: Owner[];
    pendingShares: PendingShare[];
};

const loadErrorText = 'Unable to load MFA credentials. Please try again later.';

// MUI Data Grid cofiguration
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
        field: 'seed',
        headerName: 'Code',
        width: 150,
        sortable: false,
        filterable: false,
        hideable: false,
        renderCell: (params) => {
            return <MFACode seed={params.value} name={params.row.name} />;
        },
    },
    {
        field: 'timer',
        headerName: 'Expiry',
        width: 60,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return <MFATimer />;
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
                    hideOptions={{ edit: true, share: !isMFAValid(params.row) }}
                />
            );
        },
    },
];

/**
 * Determine whether a MFA credential has valid data
 * @param mfa the MFA credential to validate
 * @returns true if the MFA credential is valid, false otherwise
 */
const isMFAValid = (mfa: MFA) => mfa.user && mfa.seed && mfa.key;

/**
 * Update the page to reflect the latest count
 * @param this context in which to execute the function
 */
const updateCount = function (this: MFAViewContext) {
    const { state, update } = this;
    state.mfaService
        .getMFACount()
        .then((totalMFAs) => {
            update({
                totalMFAs,
                ...(!totalMFAs && { isLoading: false }),
            });
        })
        .catch(() => update({ tableErrorText: loadErrorText }));
};

/**
 * Handle dashboard events dispatched by Redux
 * @param this context in which to execute the function
 */
const handleEvent = function (this: MFAViewContext) {
    const { event, update, dispatch } = this;
    switch (event.type) {
        case DashboardEventType.CREATE_CLICK:
            dispatch(clearEvent());
            update({
                isCreatorOpen: true,
            });
            break;

        case DashboardEventType.DELETE_CLICK:
            dispatch(clearEvent());
            update({
                isDeleteOpen: true,
                currentId: event.param,
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
 * Update the current MFA credentials with new ones based on the requested attributes.
 * @param this context in which to execute the function
 * @param offset the start position of the requested MFA credentials
 * @param limit the number of MFA credentials requested
 * @param sortType the sort direction
 */
const updateMFA = async function (
    this: MFAViewContext,
    offset: number,
    limit: number,
    sortType: GridSortDirection
) {
    const { update, state, dispatch } = this;
    update({ isLoading: true });

    try {
        const content = await state.mfaService.getMFAs(offset, limit, sortType);
        content.forEach((mfa) => {
            if (!isMFAValid(mfa))
                dispatch(
                    sendToast({
                        message: `There were errors in loading a MFA credential for ${mfa.name}`,
                        severity: 'error',
                    })
                );
        });
        update({ content });
    } catch (error) {
        update({ tableErrorText: loadErrorText });
    }
    update({ isLoading: false });
};

/**
 * Rerender the app table by obtaining fresh data
 * @param this context in which to execute the function
 */
const rerenderView = function (this: MFAViewContext) {
    this.dispatch(
        createEvent({
            type: DashboardEventType.RERENDER_DATA,
        })
    );
};

/**
 * Delete the current MFA credential from the user's profile
 * @param this context in which to execute the function
 */
const onDeleteAccept = async function (this: MFAViewContext) {
    const { update, state, dispatch } = this;
    update({ isDeleteLoading: true });
    try {
        await state.mfaService.deleteMFA(state.currentId!);
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

/**
 * Update the dashboard periphery to reflect the current view
 * @param this context in which to execute the function
 */
const init = function (this: MFAViewContext) {
    this.dispatch(setDisplay(Display.MFA));
    updateCount.call(this);
};

/**
 * MFAView component used to view and manage MFA credentials
 * @returns a MFAView component
 */
export default function MFAView() {
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const { state, update } = useComponentState({
        content: [],
        totalMFAs: 0,
        isLoading: true,
        isCreatorOpen: false,
        isDeleteOpen: false,
        isDeleteLoading: false,
        tableErrorText: '',
        mfaService: new MFAService(cryptoWorker, account, apolloClient),
    } as MFAViewState);

    const context = {
        state,
        update,
        dispatch,
        event,
    };

    useEffect(init.bind(context), []);
    useEffect(handleEvent.bind(context), [event]);

    return (
        <Box sx={{ height: '100%' }}>
            <AppTable
                errorText={state.tableErrorText}
                columnDef={columnDef}
                content={state.content}
                contentCount={state.totalMFAs}
                isLoading={state.isLoading}
                sortField='name'
                updateContent={updateMFA.bind(context)}
            />
            <MFACreator
                isOpen={state.isCreatorOpen}
                onClose={(modified) => {
                    update({
                        isCreatorOpen: false,
                    });
                    if (modified) rerenderView.call(context);
                }}
                mfaService={state.mfaService}
            />
            <ConfirmationDialog
                isOpen={state.isDeleteOpen}
                onClose={() => update({ isDeleteOpen: false })}
                onAccept={onDeleteAccept.bind(context)}
                title='Delete MFA Credential'
                body='Are you sure you want to delete this credential? This action cannot be undone.'
                isLoading={state.isDeleteLoading}
            />
        </Box>
    );
}
