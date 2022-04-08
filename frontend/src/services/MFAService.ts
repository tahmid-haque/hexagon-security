import * as CryptoWorker from '../workers/CryptoWorker';
import { MFA } from '../components/mfa/MFAView';
import { Account } from '../store/slices/AccountSlice';
import { GridSortDirection } from '@mui/x-data-grid';
import { promises } from 'dns';
import { Owner, PendingShare } from '../components/shares/ShareManager';
import MFAController, { MFADto } from '../controllers/MFAController';
import SecureRecordController from '../controllers/SecureRecordController';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

/**
 * Service used to manage all MFA credential related functions
 */
class MFAService {
    private cryptoWorker: typeof CryptoWorker;
    private mfaController: MFAController;
    private secureRecordController: SecureRecordController;
    private masterKey: string;
    private masterEmail: string;

    /**
     * Creates a set of encrypted strings relevant for a MFA credential
     * @param username username
     * @param seed seed
     * @returns an object containing encrypted [key, username, seed, email]
     */
    private async createEncryptedMFA(username: string, seed: string) {
        return this.cryptoWorker.encryptWrappedData(
            [username, seed, this.masterEmail],
            this.masterKey
        );
    }

    /**
     * Decrypts a MFA credential given the DTO and formats it into MFA format
     * @param dto MFA credential DTO
     * @returns the decrypted MFA credential with as many fields we were able to decrypt
     */
    private async decryptMFA(dto: MFADto): Promise<MFA> {
        let user = '';
        let seed = '';
        let key = '';
        let shares: Owner[] = [];
        let pendingShares: PendingShare[] = [];

        try {
            const [
                decryptedKey,
                decryptedUser,
                decryptedSeed,
                ...decryptedShares
            ] = await this.cryptoWorker.decryptWrappedData(
                [
                    dto.mfa.username,
                    dto.mfa.seed!,
                    ...dto.mfa.owners!,
                    ...dto.pendingShares!.map(
                        (pendingShare) => pendingShare.receiver
                    ),
                ],
                dto.key,
                this.masterKey
            );
            key = decryptedKey;
            user = decryptedUser;
            seed = decryptedSeed;
            shares = dto.mfa.owners!.map((owner, idx) => ({
                encryptedValue: owner,
                value: decryptedShares[idx],
            }));
            pendingShares = decryptedShares
                .slice(dto.mfa.owners!.length)
                .map((receiver, idx) => ({
                    shareId: dto.pendingShares![idx]._id,
                    receiver,
                }));
        } catch (error) {}

        return {
            id: dto._id,
            name: dto.name,
            user,
            seed,
            key,
            shares,
            pendingShares,
        };
    }

    /**
     * Determine whether a MFA credential exists for the given url and username
     * @param url URL to check
     * @param username username to check
     * @returns the id and key of the existing MFA credential if it exists, else null
     */
    private async checkMFAExists(url: string, username: string) {
        const domainMatches: MFADto[] = await this.mfaController.searchMFAs(
            url,
            true
        );
        try {
            await Promise.all(
                domainMatches.map(async (dto) => {
                    let key, user;
                    try {
                        [key, user] =
                            await this.cryptoWorker.decryptWrappedData(
                                [dto.mfa.username],
                                dto.key,
                                this.masterKey
                            );
                    } catch (e) {}
                    if (user === username) {
                        throw {
                            id: dto._id,
                            key,
                        };
                    }
                })
            );
            return false;
        } catch (error) {
            return true;
        }
    }

    /**
     * Creates a MFAService
     * @param cryptoWorker web worker used for all cryprographic operations
     * @param account account information
     * @param client GraphQL client used to communicate with backend
     */
    constructor(
        cryptoWorker: any,
        account: Account,
        client: ApolloClient<NormalizedCacheObject>
    ) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.cryptoWorker = cryptoWorker;
        this.mfaController = new MFAController(client, account.jwt);
        this.secureRecordController = new SecureRecordController(
            client,
            account.jwt
        );
    }

    /**
     * Counts the number of MFA credentials for this user
     * @returns the number of MMFA credentials
     */
    async getMFACount() {
        return this.mfaController.countMFAs();
    }

    /**
     * Retrieves a list of MFA credentials sorted by sortType, from offset, limited to limit
     * @param offset offset
     * @param limit limit
     * @param sortType sort direction
     * @returns a list of MFA credentials
     */
    async getMFAs(offset: number, limit: number, sortType: GridSortDirection) {
        const dtos = await this.mfaController.getMFAs(offset, limit, sortType!);
        return Promise.all(dtos.map(this.decryptMFA.bind(this)));
    }

    /**
     * Creates a new MFA credential based on the provided arguments
     * @param url website url
     * @param username username
     * @param seed seed
     * @returns the id of the created MFA credential
     */
    async createMFA(url: string, username: string, seed: string) {
        if (await this.checkMFAExists(url, username)) throw { status: 409 };
        const [encryptedKey, encryptedUser, encryptedSeed, encryptedEmail] =
            await this.createEncryptedMFA(username, seed);
        return this.mfaController.createMFA(
            url,
            encryptedUser,
            encryptedSeed,
            encryptedKey,
            encryptedEmail
        );
    }

    /**
     * Deletes a MFA credential matching the provided id
     * @param id secure record id
     * @returns the id of the deleted secure record
     */
    async deleteMFA(id: string) {
        return this.secureRecordController.deleteSecureRecord(id);
    }
}

export default MFAService;
