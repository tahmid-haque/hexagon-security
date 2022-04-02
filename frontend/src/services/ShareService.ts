import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { PendingShare } from '../components/shares/ShareManager';
import ShareController from '../controllers/ShareController';
import { Account } from '../store/slices/AccountSlice';

class ShareService {
    private shareController: ShareController;
    private masterKey: string;

    constructor(account: Account, client: ApolloClient<NormalizedCacheObject>) {
        this.masterKey = account.masterKey;
        this.shareController = new ShareController(client, account.jwt);
    }

    async createShare(
        secureRecordId: string,
        receiver: string,
        recordKey: string
    ): Promise<PendingShare> {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(
                () => resolve({ receiver: receiver, shareId: 'random-id' }),
                500
            );
        });
    }

    async finalizeShare(shareKey: string, shareID: string, isAccept: boolean) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async deletePendingShare(secureRecordId: string, shareID: string) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async revokeShare(secureRecordId: string, encryptedOwner: string) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }
}

export default ShareService;
