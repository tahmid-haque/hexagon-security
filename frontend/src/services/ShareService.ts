import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ShareDetails } from '../components/shares/ShareFinalizer';
import { PendingShare } from '../components/shares/ShareManager';
import ShareController from '../controllers/ShareController';
import { Account } from '../store/slices/AccountSlice';
import * as CryptoWorker from '../workers/CryptoWorker';

class ShareService {
    private cryptoWorker: typeof CryptoWorker;
    private shareController: ShareController;
    private masterKey: string;
    private masterEmail: string;

    constructor(
        account: Account,
        client: ApolloClient<NormalizedCacheObject>,
        cryptoWorker?: any
    ) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.shareController = new ShareController(client, account.jwt);
        this.cryptoWorker = cryptoWorker;
    }

    async getShare(shareId: string, shareKey: string): Promise<ShareDetails> {
        const dto = await this.shareController.getShare(shareId, shareKey);
        return {
            shareId,
            shareKey,
            type:
                dto.type === 'account'
                    ? 'credential'
                    : dto.type === 'seed'
                    ? 'MFA credential'
                    : 'note',
            name: dto.name,
            recordKey: dto.key,
        };
    }

    async createShare(
        secureRecordId: string,
        receiver: string,
        recordKey: string
    ): Promise<PendingShare> {
        const shareId = await this.shareController.createShare(
            receiver,
            secureRecordId,
            recordKey
        );
        return { receiver, shareId };
    }

    async finalizeShare(shareDetails: ShareDetails, isAccepted: boolean) {
        let encryptedEmail = '';
        let encryptedRecordKey = '';

        if (isAccepted) {
            [encryptedRecordKey, encryptedEmail] =
                await CryptoWorker.encryptWrappedData(
                    [this.masterEmail],
                    this.masterKey,
                    shareDetails.recordKey
                );
        }

        return this.shareController.finalizeShare(
            shareDetails.shareKey,
            shareDetails.shareId,
            isAccepted,
            encryptedEmail,
            encryptedRecordKey
        );
    }

    async deletePendingShare(secureRecordId: string, shareId: string) {
        return this.shareController.deleteShare(shareId, secureRecordId);
    }

    async revokeShare(secureRecordId: string, encryptedOwner: string) {
        return this.shareController.revokeShare(encryptedOwner, secureRecordId);
    }
}

export default ShareService;
