import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ShareDetails } from '../components/shares/ShareFinalizer';
import { PendingShare } from '../components/shares/ShareManager';
import ShareController from '../controllers/ShareController';
import { Account } from '../store/slices/AccountSlice';
import * as CryptoWorker from '../workers/CryptoWorker';

/**
 * Service used to manage all share related functions
 */
class ShareService {
    private cryptoWorker: typeof CryptoWorker;
    private shareController: ShareController;
    private masterKey: string;
    private masterEmail: string;

    /**
     * Creates a ShareService
     * @param cryptoWorker web worker used for all cryprographic operations
     * @param account account information
     * @param client GraphQL client used to communicate with backend
     */
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

    /**
     * Retrieves the share details for the requested share if allowed
     * @param shareId shareId
     * @param shareKey share secret
     * @returns the share details
     */
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

    /**
     * Creates a new pendinging share given the arguments
     * @param secureRecordId the item to share
     * @param receiver the email of the receiver
     * @param recordKey the key associated to the item
     * @returns the receiver and created share's shareId
     */
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

    /**
     * Accept or decline a given share
     * @param shareDetails share to finalize
     * @param isAccepted whether or not to accept/decline the share
     * @returns the id of the newly created secure record
     */
    async finalizeShare(shareDetails: ShareDetails, isAccepted: boolean) {
        let encryptedEmail = '';
        let encryptedRecordKey = '';

        if (isAccepted) {
            [encryptedRecordKey, encryptedEmail] =
                await this.cryptoWorker.encryptWrappedData(
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

    /**
     * Deletes a pending share matching the shareId if allowed
     * @param secureRecordId the id of the item
     * @param shareId the id of the share
     * @returns the id of the deleted share
     */
    async deletePendingShare(secureRecordId: string, shareId: string) {
        return this.shareController.deleteShare(shareId, secureRecordId);
    }

    /**
     * Revokes access to encryptedOwner to the indicated item
     * @param secureRecordId the id of the item
     * @param encryptedOwner the owner to delete
     * @returns true on success
     */
    async revokeShare(secureRecordId: string, encryptedOwner: string) {
        return this.shareController.revokeShare(encryptedOwner, secureRecordId);
    }
}

export default ShareService;
