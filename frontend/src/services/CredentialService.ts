import { GridSortDirection } from '@mui/x-data-grid';
import { Account } from '../store/slices/AccountSlice';
import CredentialController, {
    CredentialDto,
} from '../controllers/CredentialController';
import * as CryptoWorker from '../workers/CryptoWorker';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import zxcvbn from 'zxcvbn';
import { Owner, PendingShare } from '../components/shares/ShareManager';
import SecureRecordController from '../controllers/SecureRecordController';

type Credential = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: string;
    strength: CredentialStrength;
    shares: Owner[];
    pendingShares: PendingShare[];
};

enum CredentialStrength {
    BREACHED = 'Potentially Breached Password',
    WEAK = 'Weak Password',
    MODERATE = 'Moderately Secure Password',
    STRONG = 'Secure Password',
    UNKNOWN = 'Security Unknown',
}

class CredentialService {
    private cryptoWorker: typeof CryptoWorker;
    private credentialController: CredentialController;
    private secureRecordController: SecureRecordController;
    private masterKey: string;
    private masterEmail: string;

    // credits: https://www.geeksforgeeks.org/binary-search-in-javascript/
    private binarySearchHash(data: string[], hash: string): number {
        let start = 0,
            end = data.length - 1;

        const getSuffix = (i: number) => data[i].slice(0, 35);

        // Iterate while start not meets end
        while (start <= end) {
            // Find the mid index
            let mid = Math.floor((start + end) / 2);
            const val = getSuffix(mid);

            // If element is present at mid, return True
            if (val === hash) return mid;
            // Else look in left or right half accordingly
            else if (val < hash) start = mid + 1;
            else end = mid - 1;
        }

        return -1;
    }

    private async calculatePasswordSecurity(
        password: string
    ): Promise<CredentialStrength> {
        const hash = (
            await this.cryptoWorker.digestMessage(password)
        ).toUpperCase();
        try {
            const res = await this.credentialController.checkBreach(
                hash.slice(0, 5)
            );
            const data = res.split('\r\n');
            const idx = this.binarySearchHash(data, hash.slice(5));
            if (idx !== -1) return CredentialStrength.BREACHED;
        } catch (error) {}
        const score = zxcvbn(password).score;
        if (score <= 2) return CredentialStrength.WEAK;
        if (score === 3) return CredentialStrength.MODERATE;
        return CredentialStrength.STRONG;
    }

    private async createEncryptedCredential(
        username: string,
        password: string
    ) {
        return this.cryptoWorker.encryptWrappedData(
            [username, password, this.masterEmail],
            this.masterKey
        );
    }

    private async decryptCredential(dto: CredentialDto): Promise<Credential> {
        let user = '';
        let key = '';
        let password = '';
        let shares: Owner[] = [];
        let pendingShares: PendingShare[] = [];
        let strength = CredentialStrength.UNKNOWN;

        try {
            const [
                decryptedKey,
                decryptedUser,
                decryptedPass,
                ...decryptedShares
            ] = await this.cryptoWorker.decryptWrappedData(
                [
                    dto.credential.username,
                    dto.credential.password!,
                    ...dto.credential.owners!,
                    ...dto.pendingShares!.map(
                        (pendingShare) => pendingShare.receiver
                    ),
                ],
                dto.key,
                this.masterKey
            );
            key = decryptedKey;
            user = decryptedUser;
            password = decryptedPass;
            shares = dto.credential.owners!.map((owner, idx) => ({
                encryptedValue: owner,
                value: decryptedShares[idx],
            }));
            pendingShares = decryptedShares
                .slice(dto.credential.owners!.length)
                .map((receiver, idx) => ({
                    shareId: dto.pendingShares![idx]._id,
                    receiver,
                }));
            if (password)
                strength = await this.calculatePasswordSecurity(password);
        } catch (error) {}

        return {
            id: dto._id,
            name: dto.name,
            user,
            password,
            key,
            strength,
            shares,
            pendingShares,
        };
    }

    async checkCredentialExists(
        url: string,
        username: string
    ): Promise<{
        id: string;
        key: string;
    } | null> {
        const domainMatches: CredentialDto[] =
            await this.credentialController.searchCredentials(url, true);
        try {
            await Promise.all(
                domainMatches.map(async (dto) => {
                    let key, user;
                    try {
                        [key, user] =
                            await this.cryptoWorker.decryptWrappedData(
                                [dto.credential.username],
                                dto.key,
                                this.masterKey
                            );
                    } catch (e) {}
                    if (user === username) {
                        // eslint-disable-next-line no-throw-literal
                        throw {
                            id: dto._id,
                            key,
                        };
                    }
                })
            );
            return null;
        } catch (error: any) {
            return error as {
                id: string;
                key: string;
            };
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
        this.credentialController = new CredentialController(
            client,
            account.jwt
        );
        this.secureRecordController = new SecureRecordController(
            client,
            account.jwt
        );
    }

    async getCredentialCount() {
        return this.credentialController.countCredentials();
    }

    async getCredentials(
        offset: number,
        limit: number,
        sortType: GridSortDirection
    ): Promise<Credential[]> {
        const dtos = await this.credentialController.getCredentials(
            offset,
            limit,
            sortType!
        );
        return Promise.all(dtos.map(this.decryptCredential.bind(this)));
    }

    async getWebsiteCredentials(url: string): Promise<Credential[]> {
        const dtos = await this.credentialController.searchWebsiteCredentials(
            url,
            true
        );
        return Promise.all(dtos.map(this.decryptCredential.bind(this)));
    }

    async createCredential(url: string, username: string, password: string) {
        const existError = await this.checkCredentialExists(url, username);
        // eslint-disable-next-line no-throw-literal
        if (existError) throw { status: 409, ...existError };

        const [encryptedKey, encryptedUser, encryptedPass, encryptedEmail] =
            await this.createEncryptedCredential(username, password);
        return this.credentialController.addCredential(
            url,
            encryptedUser,
            encryptedPass,
            encryptedKey,
            encryptedEmail
        );
    }

    async updateCredential(
        id: string,
        url: string,
        username: string,
        password: string,
        key: string
    ) {
        const existError = await this.checkCredentialExists(url, username);
        if (existError && existError.id !== id)
            // eslint-disable-next-line no-throw-literal
            throw { status: 409, ...existError };

        const [encryptedUser, encryptedPass] =
            await this.cryptoWorker.encryptData([username, password], key);
        return this.credentialController.updateCredentials(
            encryptedUser,
            encryptedPass,
            id
        );
    }

    async deleteCredential(id: string) {
        return this.secureRecordController.deleteSecureRecord(id);
    }
}

export default CredentialService;
