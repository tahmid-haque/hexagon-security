import { Box, Grid, LinearProgress, Tooltip } from '@mui/material';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import {
    clearEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import ActionMenu from '../credentials/action-menu/ActionMenu';
import CredentialName from '../credentials/name-field/CredentialName';
import CredentialPassword from '../credentials/password-field/CredentialPassword';
import CredentialUser from '../credentials/user-field/CredentialUser';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import MFATimer from './mfa-timer/MFATimer';
import AppTable from '../shared/AppTable';
import MFAService from '../../services/MFAService';
import { useOutletContext } from 'react-router-dom';
import MFACreator from './mfa-creator/MFACreator';
import MFACode from './mfa-code/MFACode';
import { sendToast } from '../../store/slices/ToastSlice';
import { Display, setDisplay } from '../../store/slices/DisplaySlice';

type MFAViewContext = {
    state: MFAViewState;
    event: DashboardEvent;
    update: (update: Partial<MFAViewState>) => void;
    dispatch: any;
};

type MFAViewState = {
    content: MFA[];
    totalMFA: number;
    isLoading: boolean;
    isCreatorOpen: boolean;
    isDeleteOpen: boolean;
    isDeleteLoading: boolean;
    rerenderTable: boolean;
    tableErrorText: string;
    mfaService: MFAService;
    currentId?: string;
};

export type MFA = {
    id: string;
    name: string;
    user: string;
    seed: string;
    key: ArrayBuffer;
    shares: string[];
};

const loadErrorText = 'Unable to load MFA credentials. Please try again later.';

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
                    <Tooltip arrow title='Exclusive'>
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
            return (
                <ActionMenu
                    id={params.row.id}
                    hideOptions={{ edit: true, share: !isMFAValid(params.row) }}
                />
            );
        },
    },
];

const isMFAValid = (mfa: MFA) => mfa.user && mfa.seed && mfa.key.byteLength;

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

        default:
            break;
    }
};

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

const init = function (this: MFAViewContext) {
    const { state, update, dispatch } = this;
    dispatch(setDisplay(Display.MFA));
    state.mfaService
        .getMFACount()
        .then((totalMFA) => {
            update({ totalMFA });
        })
        .catch(() =>
            dispatch(
                sendToast({
                    message:
                        'Unable to load MFA credentials. Please try again later.',
                    severity: 'error',
                })
            )
        );
};

export default function MFAView() {
    const event = useAppSelector((state) => state.dashboard);
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const cryptoWorker = useOutletContext();
    const { state, update } = useComponentState({
        content: [],
        totalMFA: 0,
        isLoading: true,
        isCreatorOpen: false,
        isDeleteOpen: false,
        isDeleteLoading: false,
        rerenderTable: false,
        tableErrorText: '',
        mfaService: new MFAService(cryptoWorker, account),
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
                contentCount={state.totalMFA}
                isLoading={state.isLoading}
                sortField='name'
                updateContent={updateMFA.bind(context)}
                rerender={state.rerenderTable}
                clearRerender={() => update({ rerenderTable: false })}
            />
            <MFACreator
                isOpen={state.isCreatorOpen}
                onClose={(modified) => {
                    update({
                        isCreatorOpen: false,
                        ...(modified && { rerenderTable: true }),
                    });
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
