import { GridSortDirection } from '@mui/x-data-grid';
import {
    Credential,
    CredentialStrength,
} from '../components/credentials/CredentialsView';
import { Account } from '../store/slices/AccountSlice';
import CredentialController from '../controllers/CredentialController';
import * as CryptoWorker from '../workers/CryptoWorker';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import zxcvbn from 'zxcvbn';
import { Owner, PendingShare } from '../components/shares/ShareManager';

const encryptedCredentials: CredentialDto[] = [
    {
        id: '0',
        name: 'apple.com',
        user: 'lMez5hjJcGa2Wce3M0AN2Avoiu5EU5DWDiSeLSY1RLdsTJmldbN6z2+paH2W',
        password: 'yNJYvxryO4Xj+p4H4zXqdTedENgCWWbPYD/87U3AI3Xk6VK7rCdH',
        key: '72LxAdGsYryq82rW5MGv/YdpwrUVAvCck76kDzOjnDFcdvYo+b3OIjBfHsulL3GsqEwgiA9VIOE=',
        shares: ['mKgBQuha2ZruBhXW8yXo0Mimoyt5plYLRpyK5QJTEOhrusxlxlLwT3Q='],
        pendingShares: [],
    },
    {
        id: '1',
        name: 'amazon.com',
        user: '5pzX8gUKig0Dafi7eA5PoFIk+uGAlSEj49dTP2m4wlebRl/vKQ9HkqpBzl/54mADMzj8XA==',
        password: 'VvxGmmZjiBadYr+hBV+LIfTJm6SOb+WgYVymNAfudD7Lf49toVw02A==',
        key: 'tE3WViTOc+QESXggauXRyYFuwjs8hO+NKcpndSYaJLN1nOEMW+A4q1r+RTQRvcCRCi6wMMZNlhQ=',
        shares: ['APrHzMT4qaf2/e8t25rm6gFhP+TQvHroVZMWzaDXKde23g7bqIIqJ3I='],
        pendingShares: [],
    },
    {
        id: '2',
        name: 'twitter.com',
        user: 'eCYaeVa5OP5S46lBpsZxF5ycAtrHnf5fR+8ZaEdggslI5Kjs80JKgaWBRRtxAsA4BQ==',
        password: 'iDtukEXwrM3XKzfjj4Gom2HgPtdNjqCNj/az+lU7UUQkdtLubQ6Gwn8=',
        key: 'C9FQHatjFEd2BMm6G0nUSeXVzAqBq3sk/x5DJ7aJhf1VWRpjYxIZcikIitaF257/iANYNrzPD70=',
        shares: ['JuJ7ZHlFYbovsElkHQlnwZ1lT053Qfes9Hd2asx3AkLyrrt91MAGTv0='],
        pendingShares: [],
    },
    {
        id: '3',
        name: 'facebook.com',
        user: 'XEen4UfmvCkPRj74Z/T19aKCVzexi+lyl/13DUS6lZYtF0n3NTPWLfH6GpGf',
        password:
            '/gAvXgPnL6/EuDBGfkRSFr1BbhvoHjvFS6k44KTeFGC8GywPxYm4ZWST1Q==',
        key: '+QusehuCr8boZzfvZtyMqNh/OR8QDgdKUcbXVILffrbcWsD4SwgV7uwooj7o95Gotc5LGk0ifKc=',
        shares: ['vtUaI4HFUEg2AXpIRJjKQGYxeLo0c3fqlsmjIRA4/loRSuFBvZ89ZDg='],
        pendingShares: [],
    },
    {
        id: '4',
        name: 'instagram.com',
        user: 'ZKAOMkBKDLTxmx624mcI+nDHllDM7/dZTuhUn2i8NuDBjcGCQ1iHiLWDFpNnYTU=',
        password:
            'HAtmjH6u2NAmJXLJyIQ7mye5T0Ez8IJjl2/jf3U4C0fp1ChuoIhOZVmHi0Ij0Q==',
        key: 'c2fvT3czMogyDUUACE6tVDawR251QHZcAB/BAy7BQrYROnIpPdUzUm1MHUb4n7eNauy/9J6S/NQ=',
        shares: ['GF31KzJFy2HxAUl2ZwZvDd3AL2G4+JvqP/DFvhXEC7Ru3oa8sMEPn6Y='],
        pendingShares: [],
    },
    {
        id: '5',
        name: 'reddit.com',
        user: 'sJ7dlDZo4T4cjlmy5YLLAFJrFO9uZFcxybLGGt74XZ4ImCK8//CtrGNX0NrImKdQkmzWezCOhg==',
        password: 'yg2n+2l2kGxQ6wYI2TrN2m9zkiWRU2qHLX6o1qQtdrcPmIhTNA4=',
        key: '/9gGjszp7FcrHiFzDaZAqdlaJYslVZXn300BKccITSPXEXa7I1a4gZ+Xwno2Uw4BhemylSPCpjw=',
        shares: ['DL00QCZ7r75XwuKhMWwgTNxN0aFBGWs3OVGQDQ5M2auzX91Vu0ePyX8='],
        pendingShares: [],
    },
    {
        id: '6',
        name: 'yahoo.ca',
        user: 'lhypmsTyZSXiMNpO5DYBteiiutOa5K5eu9+qxIJjnJis1i+vedRjD4PztBlDOeYHuQ==',
        password:
            'TqlKe3FD4M7C64lWI5UbVPgaE3Fx9cAdLcH29FSOdC3NPLaEJYqhQBArzBY=',
        key: 'phgHCUSU7R9wfpmv9gMkD2gwNEOD2WTTeLHIxVrwK4OlUAwEk9WgjLuvta4ZrO29N7M34wOVXZA=',
        shares: ['sSbEoLaJP3MYKhF6n0gOf6Yruk7TKixkY5vON2uEjjgovWcQ4tYsE6Y='],
        pendingShares: [],
    },
    {
        id: '7',
        name: 'msn.com',
        user: 'GOdc51xYBzP/+wPVEgpxMzCs1gs31kw9iElWnFLQkmudCD0IzLL4Jg1DYUmmJH2nib+C',
        password: 'XrckOJJSh3QQwt9e2QQbWYvBNbNEtIEeeugnAtRb5HBOIVL4EGbakQ==',
        key: 'gIdo7G5hkuEkOsa1ddNMlKo87iDEQZwOHXf+iwoVafq7UN1ZqM8/1PrWOIxCsMjlZeNYKFEJ57A=',
        shares: ['fUKxyJ1f7TLxHjeijgmmbNacg2aVc/gZjyxFcqZJvvA/Aijqss7YKXw='],
        pendingShares: [],
    },
    {
        id: '8',
        name: 'yelp.com',
        user: 'sP4D0JVyJ/sGTNw9s81kVHyTry7H/SVQ+9gYbAE5BftESWxtuVAdWl/U0Wtb',
        password: 'GHTfLcDw6G9ES4jAD52PLJV0AXpXijnffmB+5ymW90YfMGDe5OFXapFO',
        key: 'HKCeOKOgaCnIrazNUXC6J2Uadj3w3MRwcsGSdncF1HoAEQCUMa1D5OLPdWnDj+y7rxHVtc9GsPg=',
        shares: ['SyEXXyz359h7VYPUhRxsbfFLKiANJXN0dl1r7dTZ2bqufHzRKV0cGfc='],
        pendingShares: [],
    },
    {
        id: '9',
        name: 'youtube.com',
        user: '+nzsAcZdubgRaThGy4fopdw2RnetzWd5aR5Td2u5JV7wDtoJgVjvhuzgz44WhLhYzC+Nb4E=',
        password:
            'r3yGpO2hFJrlzXuk1pe8VsF0aRmfpW2eekKpPtg79Co/UgATp7UCbdMJzsZPAg==',
        key: 'yZGTJ6yWAn35kizJiEJCkthq4jI2inpIYPeg/nHWLnak9dNNgDhzuPFE+G9thBBJeMlL2a+0kjg=',
        shares: ['ZYCOZpnoHRr/BJZyy+bzUVoWmVJ0vi6+LXGNx7FTu64qnSmWYOSr0kQ='],
        pendingShares: [],
    },
    {
        id: '10',
        name: 'google.com',
        user: 'wE8NKNkDhvKqIBcnnj5GPCsQKKnVlnsDIMJddLaoGcU5gpQsyVo2yPNqBq64bKezbg==',
        password:
            'eM6XuAjx103ZGi+P8if7fuPlBsuOiKZ6y9lILcY3rM+vJO0vod6w4hkYiRXZKEY8',
        key: 'AdXfpwtI8HRTvCbFjG57kY77wJEaxE9a/P6bC1QSi0oZlLOfUbruH8GH0xhdI5Qq57dzMlZUtdM=',
        shares: ['LCpPONaHkHB2q5DOKpwG+erSkOYX2yJrBTBJ7wa2blTp48WQ9bkOIMk='],
        pendingShares: [],
    },
    {
        id: '11',
        name: 'rbc.ca',
        user: 'TwC1KzNudaD6p3/hHRUMIe+ICSFbOMDBfJBb0aoNqS8Kj64zWuhNyitnRMg0NcvU',
        password: 'fuClMkyZJXwYe0SIeVffrCWCdm57//wrYMrR3cj0PkwhMptr7IDVeZ0b',
        key: 'Wc+GJz3v1jyxP1gRdY0GAxF/ek1r2CBGa0hZwGb9Ux9GXloPXj8DuLCW1CJ/61ViRzHbXRl0bEM=',
        shares: ['G+ZmfIzah8fh7t6zIybrKc7u6Y/c1aWolsfJnoEpgJAvmIyJANOQ8EA='],
        pendingShares: [],
    },
    {
        id: '12',
        name: 'apple.com',
        user: '0eV+Ph81U5aBARSmfhU1+YMerCO1cLkYeU5KJxdArvdyIsL34dhNRsn1FlcK',
        password:
            'wAj2hR8Ay49edYa7v7y2rebSOtbocpgOy2tE52eCN6OkTfQ7fwYsSkEag7Q=',
        key: 'Yb/3yTH3dGngGc1arMixYMhkL8tY8t6ibtKbZxP3yQgzMAUhHB/5iS7dmEoUXb8nhoxbTBSnih0=',
        shares: ['YXbAUDDIQNCqRKxGBx1qlfeV1nkpQiP/rhzBBu5DbYEPW2GqTxXuvUU='],
        pendingShares: [],
    },
    {
        id: '13',
        name: 'gmail.com',
        user: 'p099e0T6Hd5D+lXwwZxEINy4XxgGSi6ukxYreqFu1KfIDimDcP2Jw/9Y1GZ/7En6fKA=',
        password: 'SI91nN01ij+4WZBFKj7oyZXovNwXPGgcwg9AjWv0TY40dcOW6wA1',
        key: 'RemiB/qproJ1dFiaHU+vQxqq7m3Q8x5+b/t95c7r5BPfuJtJBnAcU6l4vSIOpts+ulsZqDDePjY=',
        shares: ['OrIlNRUnXH3R/z1rNjn1z0582WZX/H6l6letDLhjgNcRweGArzH4QDs='],
        pendingShares: [],
    },
    {
        id: '14',
        name: 'linkedin.com',
        user: 'nq/DKV+Wqbtk2H85Vt9pHhCmTU4muRuub9ih7mjHBJg6IcKRcPsbSC1Bdr8=',
        password:
            'yjpvjAVO+YXON43HGJSWgvTg6He7eaum2TLJBjD3vG9NR69vSH9FH8Tx6bvvDkIOje75KA==',
        key: 'Fkhb3et3gaswzHVN46Gl9yINFplYMROZ15ZixdBWYF2WuG3k9hh+m20D6uIInh+i93psDIqLF80=',
        shares: ['KcKOz5UJmAsKkaOPKzREJJUUKGReqEV8zEg5f6oZFuBfB+ZmZZ9Gc/c='],
        pendingShares: [],
    },
    {
        id: '15',
        name: 'piazza.com',
        user: 'UfkDqcbGPP75TmU0TA8Q2e+wStSvhvEDvyFQnRAxb7GAmKa4vki/wRNkjkHaGNm3',
        password: 'mUX0Ta53fturLRVdF9ggQ2srvJ7jGbcBRF0wwyaZLo6RnLYfV4ONu6K6',
        key: 'w3w3vOC0BvCtYqmIQRHsIrAd1nuCfdZCtdyRcpbCwC+fkflNuuBjGZAc2Q+8JuZ55JfJVGcAmm0=',
        shares: ['hjupL50bnqSKbT7otLOZnNWZ+PFzVCCq2EeFrWszgh3rnj11svOv8nk='],
        pendingShares: [],
    },
    {
        id: '16',
        name: 'utoronto.ca',
        user: 'Y4hlqzna5dohT0+K/tf4S/9vZwrTIes/paHciFYToey7BdVlsqYBWAzx5qdl',
        password: 'VT1ggFI8LxbYMBF/9ODOIVbnaWCj8EJ/ZkMqlfA8PxIDInVW22ar',
        key: 'kgcg0I8hv0GCWHp46Dz1TLzcfWN3yIMRNcjozusxzaf1S0n9MbpiIv3ZG4UrRIifjbBqgdqov/o=',
        shares: ['x1QSyffC/O6UtvM0dULeoJSL53TeCtaTpYa63Ws8yPwp+caqmslMZQM='],
        pendingShares: [],
    },
    {
        id: '17',
        name: 'ryerson.ca',
        user: '/Je43KNUB7tJsSTu/rNLK8mjEC351Bf3uU2kfvqBbzZgSMry3Nq49i/tfByD40qqr5Qm0g==',
        password:
            'rCQR7ryaeqoTUFwZltsudix6GyYAAhI8Zjq1UmVQNDtoKOtRyHUtGzimNmoSvA==',
        key: 'bn4ChNRTkjki1Z55QOpIjLNK+OFX+PKfv2VOrVpdKdC6rYaqC2nJgJrU/XzXO9aFAdrI2YWK3NU=',
        shares: ['qSYUEgp7IxOGBqU1KnDq0fVzoyYqjTejFTh9mhJU/1BCnXorZf1300g='],
        pendingShares: [],
    },
    {
        id: '18',
        name: 'uwaterloo.ca',
        user: '9ev6d+cKbMKS3xxGBDb9vcxZHWoeRJDGBmm+ob5j+y6FTXW6R4gSgXKlhcaHNw==',
        password: 'GXnLguv3B7fi3xLVYFHwcXM8eQqWThi1mlsiBdnZUGPU2lQusJ6mrE+E',
        key: 'R1HrcCVPh84UKIXTe3yvFhz0C7/YFFkSlY0ubblQC9Mq/lYkVwq/a/CjgTF1Y+h3WDYwhdNbbUI=',
        shares: ['mRWpn+sIlpNRwruLbsBCatEXfwxJtccvvKcalj36Uvo4SlYRG2osdKg='],
        pendingShares: [],
    },
    {
        id: '19',
        name: 'ebay.ca',
        user: 'sbyevGpfNmRLrvaD/mvssouVn++TcjLefyjtrBG09sUE+TJUdiyuYg2W71IjMoH+g49O4Q==',
        password:
            'JLeXckYQbbxa6SynHgGlXHEad8h5L5Lvd2OTclQGEDIuJxVpAxnWAb7lfyG/PNW4RCTckFcA',
        key: 'S0Vs+tY3T1N10TZjJCT877DM4S4+LHmAfj/sUZWfjv8FUhSSjX6jwHhlBOhi2rDMbammMPiFIjU=',
        shares: ['+dtrYrRQmKYel7IV83kekAtRbEKa/L88R1baay8EoH94HvNr7+62PnQ='],
        pendingShares: [],
    },
    {
        id: '20',
        name: 'apple.com',
        user: 'mZ5LSBF2x5+r7o8NzXDz6pTsUGKGatqiMwv1ZcJPk9cIKyWtf8PHwYgGjf8b',
        password: '5maYBFzpL7g6MzLiaoBvHx48iVvHiOaLtuFg87UR09xnHQQlO1dY',
        key: 'dfnbyRECEyTgIQXgneI6qKKafrlG1igVEEWI9vB2CQFvxqTb5y+LyyqJfmYUZr+6M3pdcMhFBes=',
        shares: ['wMHRzMYq2FpwRogSgtgEPBIQTN/m7+8H+Qp8BE+Pu5/L1VxBg3euLlc='],
        pendingShares: [],
    },
    {
        id: '21',
        name: 'snapchat.com',
        user: 'AD+9cgX280GrGohMix3arNq94Ev+HLlY/a6KgdxBDy5L1XstfWr2yzLeabJ28BZhmw==',
        password:
            'IwBCxxIs96jXM6GHkoCLyugjBoWq5OAQSCTvtKZfHUFKvQk6o/krU+byiQjK2wlNqA==',
        key: 'lv5ZsbPZBhHRqVEwbDcCYmteJpGEsllVGhZzSZIBRf7Z4Qexua6JWmSOfukkULDC9rc1k2bjkso=',
        shares: ['PsdDppDqwd3vPtcnaFtEsLZLQET1VmqMmJZ1iQNTI2/x27kBXnL18O8='],
        pendingShares: [],
    },
    {
        id: '22',
        name: 'etsy.com',
        user: '0bexcWcEhR+a+gJx3WLAp6zWQKugDqospXAZqdyEqNzt/76w6KdzECkYsM2rreCaE+zMhQ==',
        password:
            '3ttK7iAGVxQhkeCNSUM7a2b6ZLqJ6AH7ir9QuoYQ5Ed1YY9EGYIkS8MSTJscZxy2pWSwjw==',
        key: 'IFgxlS/ePRhTx1284YjnDZ+qIlfbrftOgVgWMiZtVsJW5eruY/hniat5fpskM1KryyWerW1B8Yg=',
        shares: ['f0Uz/GVGaz/1ULSbUyfaHd+ZqQfhDUtNeB7aGYgZS4fzDWpsagOh4A8='],
        pendingShares: [],
    },
];

type CredentialDto = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: string;
    shares: string[];
    pendingShares: PendingShare[];
};

class CredentialService {
    private cryptoWorker: typeof CryptoWorker;
    private credentialController: CredentialController;
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
            if (idx !== -1) {
                const [_, count] = data[idx].split(':');
                const isBreached = Number(count) >= 10;
                return CredentialStrength.BREACHED;
            }
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

    private async decryptCredential(
        credential: CredentialDto
    ): Promise<Credential> {
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
                    credential.user,
                    credential.password,
                    ...credential.shares,
                    ...credential.pendingShares.map(
                        (pendingShare) => pendingShare.receiver
                    ),
                ],
                credential.key,
                this.masterKey
            );
            key = decryptedKey;
            user = decryptedUser;
            password = decryptedPass;
            shares = credential.shares.map((owner, idx) => ({
                encryptedValue: owner,
                value: decryptedShares[idx],
            }));
            pendingShares = decryptedShares
                .slice(credential.shares.length)
                .map((receiver, idx) => ({
                    shareId: credential.pendingShares[idx].shareId,
                    receiver,
                }));
            strength = await this.calculatePasswordSecurity(password);
        } catch (error) {}

        return {
            id: credential.id,
            name: credential.name,
            user,
            password,
            key,
            strength,
            shares,
            pendingShares,
        };
    }

    private async checkCredentialExists(
        url: string,
        username: string
    ): Promise<{
        id: string;
        key: string;
    } | null> {
        // TODO: connect to real api later
        const domainMatches = encryptedCredentials.filter(
            ({ name }) => name === url
        );
        try {
            await Promise.all(
                domainMatches.map(async (credentialDto) =>
                    this.decryptCredential
                        .call(this, credentialDto)
                        .catch()
                        .then(({ user, id, key }) => {
                            if (user === username) {
                                throw {
                                    id,
                                    key,
                                };
                            }
                        })
                )
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
    }

    async getCredentialCount() {
        // TODO: connect to real api later
        return encryptedCredentials.length;
    }

    async getCredentials(
        offset: number,
        limit: number,
        sortType: GridSortDirection
    ) {
        // TODO: connect to real api later

        return new Promise((resolve) => {
            let credentials = encryptedCredentials.sort((a, b) =>
                a.name < b.name ? -1 : a.name === b.name ? 0 : 1
            );
            if (sortType === 'desc') credentials = credentials.reverse();
            resolve(
                Promise.all(
                    credentials
                        .slice(offset, offset + limit)
                        .map(this.decryptCredential.bind(this))
                )
            );
        }) as Promise<Credential[]>;
    }

    async createCredential(url: string, username: string, password: string) {
        const existError = await this.checkCredentialExists(url, username);
        if (existError) throw { status: 409, ...existError };

        const [encryptedKey, encryptedUser, encryptedPass, encryptedEmail] =
            await this.createEncryptedCredential(username, password);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
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
            throw { status: 409, ...existError };

        const [encryptedUser, encryptedPass] =
            await this.cryptoWorker.encryptData([username, password], key);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async deleteCredential(id: string) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }
}

export default CredentialService;
