import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
    TextField,
    Tooltip,
} from '@mui/material';
import ShareService from '../../services/ShareService';
import { sendToast } from '../../store/slices/ToastSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useComponentState } from '../../utils/hooks';
import { MFA } from '../mfa/MFAView';
import { Note } from '../notes/NotesView';
import { Credential } from '../credentials/CredentialsView';
import AppModal from '../shared/AppModal';
import { useEffect } from 'react';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import {
    clearEvent,
    createEvent,
    DashboardEvent,
    DashboardEventType,
} from '../../store/slices/DashboardSlice';

export enum ShareView {
    OWNER,
    PENDING,
    CREATE,
}

export type Owner = {
    encryptedValue: string;
    value: string;
};

export type PendingShare = {
    receiver: string;
    shareId: string;
};

export type ShareInfo = {
    id: string;
    key: string;
    owners: Owner[];
    pendingShares: PendingShare[];
};

export type ShareManagerProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const getShareInfo = (data: Credential | MFA | Note): ShareInfo => ({
    id: data.id,
    key: data.key,
    owners: data.shares,
    pendingShares: data.pendingShares,
});

type ShareManagerState = {
    shareService: ShareService;
    currentTab: ShareView;
    currentEmail: string;
    invalidInputText: string;
    isInputValid: boolean;
    isLoading: boolean;
    isDeleteLoading: boolean;
    isDeleteOpen: boolean;
    currentDelete: string;
    isModified: boolean;
    shareInfo: ShareInfo;
};

type ShareManagerContext = {
    state: ShareManagerState;
    update: (update: Partial<ShareManagerState>) => void;
    dispatch: any;
    props: ShareManagerProps;
    event: DashboardEvent;
};

const onViewChange = function (
    this: ShareManagerContext,
    _: any,
    newView: ShareView
) {
    if (this.state.isLoading) return;
    this.update({
        currentTab: newView,
        currentEmail: '',
        invalidInputText: '',
        isInputValid: true,
    });
};

const onEmailChange = function (
    this: ShareManagerContext,
    event: React.ChangeEvent<HTMLInputElement>
) {
    // taken from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
    const emailMatcher =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const value = event.target.value.toLowerCase();
    const isInputValid = emailMatcher.test(value);
    this.update({
        currentEmail: value.trim(),
        invalidInputText: '',
        isInputValid,
    });
};

const onEmailSubmit = async function (this: ShareManagerContext) {
    const { state, update, dispatch, props } = this;
    if (state.isLoading) return;
    if (!state.isInputValid || !state.currentEmail) {
        return update({
            invalidInputText: 'Please enter a valid email',
            isInputValid: false,
        });
    }
    update({ isLoading: true });
    const isExists = state.shareInfo.owners
        .map((owner) => owner.value)
        .concat(state.shareInfo.pendingShares.map((share) => share.receiver))
        .findIndex((email) => email === state.currentEmail);
    if (isExists !== -1)
        dispatch(
            sendToast({
                message: `This item is already being shared with ${state.currentEmail}`,
                severity: 'error',
            })
        );
    else {
        try {
            const newPendingShare = await state.shareService.createShare(
                state.shareInfo.id,
                state.currentEmail,
                state.shareInfo.key
            );
            state.shareInfo.pendingShares.push(newPendingShare);
            dispatch(
                sendToast({
                    message: `Sent a share request to ${state.currentEmail}`,
                    severity: 'success',
                })
            );
            update({
                currentTab: ShareView.PENDING,
                currentEmail: '',
                invalidInputText: '',
                isInputValid: true,
                isModified: true,
            });
        } catch (error: any) {
            console.log(error);
            dispatch(
                sendToast({
                    message:
                        'Something went wrong and we were unable to share this item. Please try again later.',
                    severity: 'error',
                })
            );
        }
    }
    update({ isLoading: false });
};

const onSuccessfulDelete = function (
    this: ShareManagerContext,
    changeView: boolean
) {
    this.dispatch(
        sendToast({
            message: 'Successfully unshared this item.',
            severity: 'success',
        })
    );
    this.update({
        isDeleteOpen: false,
        isModified: true,
        ...(changeView && { currentTab: getNextView(this.state.shareInfo) }),
    });
};

const onDeleteError = function (this: ShareManagerContext) {
    this.dispatch(
        sendToast({
            message:
                'Something went wrong and we were unable to unshare this item. Please try again later.',
            severity: 'error',
        })
    );
};

const onPendingShareDelete = async function (this: ShareManagerContext) {
    const { state, update, props } = this;
    update({ isDeleteLoading: true });
    try {
        await state.shareService.deletePendingShare(
            state.shareInfo.id,
            state.currentDelete
        );
        state.shareInfo.pendingShares.splice(
            state.shareInfo.pendingShares.findIndex(
                (pendingShare) => pendingShare.shareId === state.currentDelete
            ),
            1
        );
        onSuccessfulDelete.call(this, state.shareInfo.pendingShares.length < 1);
    } catch (error) {
        onDeleteError.call(this);
    }
    update({ isDeleteLoading: false });
};

const onOwnerShareDelete = async function (this: ShareManagerContext) {
    const { state, update, props } = this;
    update({ isDeleteLoading: true });
    try {
        await state.shareService.revokeShare(
            state.shareInfo.id,
            state.currentDelete
        );
        state.shareInfo.owners.splice(
            state.shareInfo.owners.findIndex(
                (owner) => owner.encryptedValue === state.currentDelete
            ),
            1
        );
        onSuccessfulDelete.call(this, state.shareInfo.owners.length < 2);
    } catch (error) {
        onDeleteError.call(this);
    }
    update({ isDeleteLoading: false });
};

const onClose = function (this: ShareManagerContext) {
    this.props.onClose();
    if (this.state.isModified) {
        this.update({
            isModified: false,
        });
        this.dispatch(createEvent({ type: DashboardEventType.RERENDER_DATA }));
    }
};

const handleDashboardEvent = function (this: ShareManagerContext) {
    if (this.event.type === DashboardEventType.SHARE_CLICK) {
        const shareInfo: ShareInfo = {
            ...this.event.param,
            owners: [...this.event.param.owners],
            pendingShares: [...this.event.param.pendingShares],
        };
        this.update({
            shareInfo,
            currentTab: getNextView(shareInfo),
        });
        this.dispatch(clearEvent());
    }
};

const generateOwnerItem = (
    email: string,
    isLoading: boolean,
    onDelete: () => void
) => (
    <Box key={email} sx={{ overflow: 'hidden' }}>
        <ListItem
            secondaryAction={
                <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={onDelete}
                    disabled={isLoading}
                >
                    <DeleteIcon color='error' />
                </IconButton>
            }
        >
            <Tooltip arrow title={email} placement='left'>
                <ListItemIcon>
                    <AccountCircleIcon fontSize='large' />
                </ListItemIcon>
            </Tooltip>

            <ListItemText
                primary={email}
                sx={{
                    '.MuiTypography-root': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                }}
            />
        </ListItem>
        <Divider sx={{ mx: 1 }} />
    </Box>
);

const getNextView = (shareInfo: ShareInfo) =>
    shareInfo.owners.length > 1
        ? ShareView.OWNER
        : shareInfo.pendingShares.length > 0
        ? ShareView.PENDING
        : ShareView.CREATE;

export default function ShareManager(props: ShareManagerProps) {
    const account = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();
    const event = useAppSelector((state) => state.dashboard);
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const { state, update } = useComponentState({
        shareService: new ShareService(account, apolloClient),
        currentTab: ShareView.CREATE,
        currentEmail: '',
        invalidInputText: '',
        isInputValid: true,
        isLoading: false,
        isDeleteLoading: false,
        isDeleteOpen: false,
        isModified: false,
        currentDelete: '',
        shareInfo: {
            id: '',
            key: '',
            owners: [],
            pendingShares: [],
        },
    } as ShareManagerState);

    const context = { state, update, dispatch, props, event };
    useEffect(handleDashboardEvent.bind(context), [event]);

    return (
        <AppModal
            isOpen={props.isOpen}
            onClose={onClose.bind(context)}
            modalTitle='Share Manager'
        >
            <Box sx={{ width: 400 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={state.currentTab}
                        onChange={onViewChange.bind(context)}
                    >
                        <Tab
                            label='Owners'
                            value={ShareView.OWNER}
                            disabled={
                                state.isLoading ||
                                state.shareInfo.owners.length < 2
                            }
                        />
                        <Tab
                            label='Pending'
                            value={ShareView.PENDING}
                            disabled={
                                state.isLoading ||
                                state.shareInfo.pendingShares.length < 1
                            }
                        />
                        <Tab
                            label='Create'
                            value={ShareView.CREATE}
                            disabled={state.isLoading}
                        />
                    </Tabs>
                </Box>
                {state.currentTab !== ShareView.CREATE && (
                    <List
                        dense={true}
                        sx={{
                            maxHeight: 440,
                            overflowY: 'auto',
                        }}
                    >
                        {state.currentTab === ShareView.OWNER
                            ? state.shareInfo.owners
                                  .filter(
                                      (owner) => owner.value !== account.email
                                  )
                                  .map((owner) =>
                                      generateOwnerItem(
                                          owner.value,
                                          state.isLoading,
                                          () =>
                                              update({
                                                  isDeleteOpen: true,
                                                  currentDelete:
                                                      owner.encryptedValue,
                                              })
                                      )
                                  )
                            : state.shareInfo.pendingShares.map((share) =>
                                  generateOwnerItem(
                                      share.receiver,
                                      state.isLoading,
                                      () =>
                                          update({
                                              isDeleteOpen: true,
                                              currentDelete: share.shareId,
                                          })
                                  )
                              )}
                    </List>
                )}
                {state.currentTab === ShareView.CREATE && (
                    <TextField
                        fullWidth
                        disabled={state.isLoading}
                        error={!state.isInputValid}
                        label='Email'
                        value={state.currentEmail}
                        type='text'
                        helperText={state.invalidInputText ?? ''}
                        variant='standard'
                        sx={{ mb: 2, mt: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <Tooltip
                                        arrow
                                        title={`Share`}
                                        placement='right'
                                    >
                                        <IconButton
                                            onClick={onEmailSubmit.bind(
                                                context
                                            )}
                                            edge='end'
                                        >
                                            <ChevronRightIcon color='primary' />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                        onChange={onEmailChange.bind(context)}
                    />
                )}
                <Box sx={{ position: 'relative', float: 'right' }}>
                    <Button
                        variant='contained'
                        disabled={state.isLoading}
                        onClick={onClose.bind(context)}
                    >
                        Done
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
            </Box>
            <ConfirmationDialog
                isOpen={state.isDeleteOpen}
                onClose={() => update({ isDeleteOpen: false })}
                onAccept={
                    state.currentTab === ShareView.CREATE
                        ? onOwnerShareDelete.bind(context)
                        : onPendingShareDelete.bind(context)
                }
                title='Delete Share'
                body='Are you sure you want to delete this share? This action cannot be undone.'
                isLoading={state.isDeleteLoading}
            />
        </AppModal>
    );
}
