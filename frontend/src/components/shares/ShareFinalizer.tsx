import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useComponentState } from '../../utils/hooks';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { useEffect } from 'react';
import ShareService from '../../services/ShareService';
import {
    ApolloClient,
    NormalizedCacheObject,
    useApolloClient,
} from '@apollo/client';
import { sendToast } from '../../store/slices/ToastSlice';

type ShareFinalizerState = {
    isOpen: boolean;
    isLoading: boolean;
    shareId: string;
    shareKey: string;
    nextLocation: string;
    shareService: ShareService;
};

type ShareFinalizerContext = {
    state: ShareFinalizerState;
    update: (update: Partial<ShareFinalizerState>) => void;
    dispatch: any;
    navigate: any;
};

const finalizeShare = async function (
    this: ShareFinalizerContext,
    isAccept: boolean
) {
    const { update, state, dispatch } = this;
    update({ isLoading: true });
    try {
        await state.shareService.finalizeShare(
            state.shareKey,
            state.shareId,
            isAccept
        );
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
                    'Something went wrong and we were unable to finalize your share. This share may be invalid. Please try again later.',
                severity: 'error',
            })
        );
    }
    update({ isLoading: false });
};

const close = function (this: ShareFinalizerContext) {
    this.update({ isOpen: false });
    setTimeout(() => this.navigate(this.state.nextLocation), 300);
};

const onInit = function (this: ShareFinalizerContext) {
    const queryParams = new URL(window.location.href).searchParams;
    this.update({
        shareId: queryParams.get('shareId') ?? this.state.shareId,
        shareKey: queryParams.get('shareKey') ?? this.state.shareKey,
        nextLocation: queryParams.get('next') ?? this.state.nextLocation,
    });
};

export default function ShareFinalizer() {
    const account = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const apolloClient =
        useApolloClient() as ApolloClient<NormalizedCacheObject>;
    const { state, update } = useComponentState({
        isOpen: true,
        isLoading: false,
        shareId: '',
        shareKey: '',
        nextLocation: '/app/credentials',
        shareService: new ShareService(account, apolloClient),
    } as ShareFinalizerState);

    const context = { state, update, dispatch, navigate };
    useEffect(onInit.bind(context), []);

    return (
        <ConfirmationDialog
            isOpen={state.isOpen}
            onClose={close.bind(context)}
            body='Would you like to accept this shared item?'
            title='Finalize Share'
            isLoading={state.isLoading}
            onAccept={finalizeShare.bind(context, true)}
            onReject={finalizeShare.bind(context, false)}
            primaryActionText='Accept'
            secondaryActionText='Decline'
        />
    );
}
