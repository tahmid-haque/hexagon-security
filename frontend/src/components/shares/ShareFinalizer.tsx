import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useComponentState } from '../../utils/hooks';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useEffect } from 'react';
import ShareService from '../../services/ShareService';
import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import { sendToast } from '../../store/slices/ToastSlice';
import { Box, LinearProgress } from '@mui/material';

export type ShareDetails = {
    name: string;
    type: 'note' | 'credential' | 'MFA credential';
    recordKey: string;
    shareId: string;
    shareKey: string;
};

type ShareFinalizerState = {
    isOpen: boolean;
    isLoading: boolean;
    nextLocation: string;
    shareService: ShareService;
    shareDetails?: ShareDetails;
};

type ShareFinalizerContext = {
    state: ShareFinalizerState;
    update: (update: Partial<ShareFinalizerState>) => void;
    dispatch: any;
    navigate: any;
};

/**
 * Accept or decline the share using the server.
 * @param this context in which to execute the function
 * @param isAccept whether or note to accept the offered share
 */
const finalizeShare = async function (
    this: ShareFinalizerContext,
    isAccept: boolean
) {
    const { update, state, dispatch } = this;
    update({ isLoading: true });
    try {
        await state.shareService.finalizeShare(state.shareDetails!, isAccept);
        dispatch(
            sendToast({
                message: `Successfully ${
                    isAccept ? 'accepted' : 'declined'
                } the shared item.`,
                severity: 'success',
            })
        );
        close.call(this);
    } catch (error: any) {
        dispatch(
            sendToast({
                message:
                    'Something went wrong and we were unable to finalize your share. Please try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false });
};

/**
 * Close the share finalizer
 * @param this context in which to execute the function
 */
const close = function (this: ShareFinalizerContext) {
    this.update({ isOpen: false, isLoading: false });
    setTimeout(() => this.navigate(this.state.nextLocation), 300);
};

/**
 * Try to obtain share information using the URL and verifying it with the server
 * @param this context in which to execute the function
 */
const onInit = async function (this: ShareFinalizerContext) {
    const queryParams = new URL(window.location.href).searchParams;
    this.update({
        nextLocation: queryParams.get('next') ?? this.state.nextLocation,
    });
    try {
        const shareId = queryParams.get('shareId');
        const shareKey = queryParams.get('shareKey');
        if (!shareId || !shareKey) throw { status: 404 };
        this.update({
            shareDetails: await this.state.shareService.getShare(
                shareId,
                shareKey
            ),
            isOpen: true,
            isLoading: false,
        });
    } catch (error: any) {
        this.dispatch(
            sendToast({
                message:
                    'We were unable to locate this share or you may not have access.',
                severity: 'error',
            })
        );
        close.call(this);
    }
};

/**
 * ShareFinalizer component used to accept or decline share
 * @returns a ShareFinalizer component
 */
export default function ShareFinalizer() {
    const cryptoWorker = useOutletContext();
    const account = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const { state, update } = useComponentState({
        isOpen: false,
        isLoading: true,
        nextLocation: '/app/credentials',
        shareService: new ShareService(account, apolloClient, cryptoWorker),
    } as ShareFinalizerState);

    const context = { state, update, dispatch, navigate };
    useEffect(() => {
        onInit.call(context);
    }, []);

    const body = `Would you like to accept this ${state.shareDetails?.type}${
        state.shareDetails?.type !== 'note'
            ? ` for ${state.shareDetails?.name}`
            : ''
    }?`;

    return (
        <Box sx={{ width: 'calc(100vw - 65px)' }}>
            {state.isLoading && <LinearProgress />}
            <ConfirmationDialog
                isOpen={state.isOpen}
                onClose={close.bind(context)}
                body={body}
                title='Finalize Share'
                isLoading={state.isLoading}
                onAccept={finalizeShare.bind(context, true)}
                onReject={finalizeShare.bind(context, false)}
                primaryActionText='Accept'
                secondaryActionText='Decline'
            />
        </Box>
    );
}
