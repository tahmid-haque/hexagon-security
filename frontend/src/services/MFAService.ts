import * as CryptoWorker from '../workers/CryptoWorker';
import { MFA } from '../components/mfa/MFAView';
import { Account } from '../store/slices/AccountSlice';
import { GridSortDirection } from '@mui/x-data-grid';
import { promises } from 'dns';
import { Owner, PendingShare } from '../components/shares/ShareManager';
import MFAController, { MFADto } from '../controllers/MFAController';
import SecureRecordController from '../controllers/SecureRecordController';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
class MFAService {
    private cryptoWorker: typeof CryptoWorker;
    private mfaController: MFAController;
    private secureRecordController: SecureRecordController;
    private masterKey: string;
    private masterEmail: string;

    private async createEncryptedMFA(username: string, seed: string) {
        return this.cryptoWorker.encryptWrappedData(
            [username, seed, this.masterEmail],
            this.masterKey
        );
    }

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

    async getMFACount() {
        return this.mfaController.countMFAs();
    }

    async getMFAs(offset: number, limit: number, sortType: GridSortDirection) {
        const dtos = await this.mfaController.getMFAs(offset, limit, sortType!);
        return Promise.all(dtos.map(this.decryptMFA.bind(this)));
    }

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

    async deleteMFA(id: string) {
        return this.secureRecordController.deleteSecureRecord(id);
    }
}

export default MFAService;
