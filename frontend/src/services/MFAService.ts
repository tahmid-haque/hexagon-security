import * as CryptoWorker from '../workers/CryptoWorker';
import { MFA } from '../components/mfa/MFAView';
import { Account } from '../store/slices/AccountSlice';
import { GridSortDirection } from '@mui/x-data-grid';
import { promises } from 'dns';
import { Owner, PendingShare } from '../components/shares/ShareManager';

const encryptedMFAs: MFADto[] = [
    {
        id: '0',
        name: 'apple.com',
        user: '9c0C9B0hflq5IkitlJO0dF/MgE5jwlhFAFvZx5TqROJVgmjV5l7Pz95CsmBt',
        seed: 'A9YiqHGmWgh4Yc6D3T1JVbkA6v3oy8R/c6PMyvUW/oFci1DEZxM=',
        key: 'z8hMqNJ19rnEnW7gyFHdOh8O7ffm5EX/o4nSE0JXb/ocIUl+CIOQw7bGYurEQhhl9GGMU+42GKM=',
        shares: ['pp51lODlUbZLFyQXh22a+A7pzicgjLk/k+O3govZE78D2ULgNhzX7tA='],
        pendingShares: [],
    },
    {
        id: '1',
        name: 'amazon.com',
        user: 'YjCHI8ENxbvMXX3HpxGZey9mq05JKwFAgwLdSZ0z4btfHkID/+mQAvKAgExiNq4OgIpAiw==',
        seed: 'I186hFR4A600LTIO1o3q/dq5I4m3Qwe4r/IiyIebFbEow/eeInM=',
        key: '7F70apUhK0HdmbqHGPUIcO4T2ndMArqz3SvInhZuHszxS9Dp1Kk/P0syeRkevTtGerZrOiX23Rg=',
        shares: ['+WxcPABsJkMJcpdcN15myh7n0WKhZFqOtzc0NEzLoVReXjY1XtioIgs='],
        pendingShares: [],
    },
    {
        id: '2',
        name: 'twitter.com',
        user: 'AK2/S5NVjGvIP+aFZJLWvRleZhfNv+8CUJyihY52y0lm2aYwqsZiUOfoEZygS5mvmg==',
        seed: 'Q5tPvXmq0JXz0CSUSVTJu6mqFgnFkozzxksf9N9Z4N8nKABVumdN',
        key: '1LcoJwZy2YZ0ERzc7taGL34F/4sVcis6arxOUuXev1ZP045yxuvD5m/5N5vRZs9tabOY5iSwC7s=',
        shares: ['clzd9NMFugIAE6/y/ZnS7JMaT4/+Jj49jzo2O4R8TacA7ZhAnphajLg='],
        pendingShares: [],
    },
    {
        id: '3',
        name: 'facebook.com',
        user: 'WmcIQW8yegD3cxYHn9U2Y8EQsTz9mL5gn+zHWEVIEIINR5vqnk/94f6J3bbI',
        seed: 'UhjPXgDAVYINvcczvcoEDMNt9weXfrIdK7GTxnGcyOXymS+yS34=',
        key: 'wWz2Ok3RQywKdcQpZCdwXZ7utZ1vWVb5GJzJNoXARiNHJt/HcYbaDcSM+I/Oq4HFrKlSFbqPGAw=',
        shares: ['fg+n6HPM5I8uZDV6TQ+lDlgjYq48MlgGjEemhXE1TAb8sE8DoBdomH0='],
        pendingShares: [],
    },
    {
        id: '4',
        name: 'instagram.com',
        user: '9VD1BdYPME1UYQrO5ZNddntI7hhCBIe4T05qzvFAyEZ8AXk599ORYcGWrNjv8yo=',
        seed: 'UqZ3OQAykrUzQqAAFxi6WkVJWJn4hcK7oAGj9ViKfq8p1i/BLxg=',
        key: 'cDLhNwUUZ3B8tXwdToLjYcMKiJ7QyB4kJjubsWq9thjWdPiPAMXxosyF0WjX3iT2jEYOE62TXq8=',
        shares: ['gb9Fz0/8HgwFe/9AN1WHI1omUzocZVgojnIi0Ljo2mgWlTy8kjsTUuI='],
        pendingShares: [],
    },
    {
        id: '5',
        name: 'reddit.com',
        user: 'WE/MjqsDpvV6ecL+0zVf7h3aBP242o+deLEqhd1IxYF4PWY+Xu0ff2+H+J2w+hVvZFgMliQ7HQ==',
        seed: 'ai9Nxl76wX+4ACwGN/OCdqHdC/IhSTiyr2fifIU61hTPSLMPydE=',
        key: 'VfwZzAUrRLIxzkXl45cheMSiFaZhqecC0oJ2tTb/H/crhwt6k0CIodZ2WHNDaXVAwnTA77mcJNk=',
        shares: ['Kb9DWuszcpjYG4vIU93xcG/qPmkp42c6P72hhGivN/GajMkBA0jsdpA='],
        pendingShares: [],
    },
    {
        id: '6',
        name: 'yahoo.ca',
        user: 'DreljmEyvu6V/RjB07X6t9UVSM/Hl6fFErvTYFX82CZn1ReXm6r7LKRNj90xQlv1jg==',
        seed: 'bH7oWKuTHfI5H4DwjEA7JcDoOi0ly8a5BUfHgm4EdKfweOaqc38=',
        key: 'dpMFvOn/Zc0CcrLYgDnFIcdUSmZEf+YKzWIt3Yf2xYJ3sG4ynUGIfC7sIVs4aD/9vcuQF9oYa78=',
        shares: ['lH6cK3EtwR9aXz0fFUUMkQLSU5fkyh8HGW2xFR+mCihHuvsQ5VshlJA='],
        pendingShares: [],
    },
    {
        id: '7',
        name: 'msn.com',
        user: 'E7ZexB9ehsrhLYDL80UG63aAyqadphUklx0jDkF5vSmq1tKt/7wOvVDNktSHUzXa2axK',
        seed: '+Sm/dnoya9nahk32WYCY1eJ26XlwOnwNU6UVwdlR7XVyI4pdmCfE',
        key: 't7CHM8PpP/r12JdDDVqfWD8ZBHGmESuwqhMvncPyQi73glwtQrXYkEKZYDPKAcYBjuHqDLTIr/0=',
        shares: ['ofG08ODjP3D3mH4nPSzoFFoasQ1EP2PIAJk3hMWzd77JDpzo1XwLdek='],
        pendingShares: [],
    },
    {
        id: '8',
        name: 'yelp.com',
        user: 'GMWPKhg+fFgwOvHZlQtOCRsudFKHE40yzQztNxe6BGQ7hxV0BQgv4feOKdNi',
        seed: 'T8fKczF7MyGm02URZfISXynPMRfZt+sg8DjDloINRWa+CN8Ldj+r',
        key: 'xo1I3DASnXiuRMwxzXWleuK//EZNW5IpEJUdxsXPs5JYUNZxY3WCt2QHWXh/wMr7hZNbyTRKjpc=',
        shares: ['ppW0lkKy7p3KaAFTMqIAuxNPNsBnMeugYeoOWwmZH2mT6Kzu6mvPsyQ='],
        pendingShares: [],
    },
    {
        id: '9',
        name: 'youtube.com',
        user: 'Q6Y5TG5epLWrZXC9PyEMZEtG/L377C29DdpshddBYWF9zBNHpPWkvdj9Zu6M0uhGooWunuI=',
        seed: 'AfQkT+G6Ym0NGIE+NQggr/BK54uPTUmjk/oBg2iHuVbQE2Y3ZbI=',
        key: 'zVPuHrI/uQcgmD/n9dDUer/hrDVK8y6TghoEu6guuJ3CqC7RPGAX1ehq2JNKcFpYLHZCTSR5yn0=',
        shares: ['al/U+Swpy9rDkmWIDthBF6gOoOT8IDndc0YCB0lDC8Bu/uHLTmnmIeo='],
        pendingShares: [],
    },
    {
        id: '10',
        name: 'google.com',
        user: 'CRQ4sqZyPAxSOdkWCusslBdyaBCTyf2OEWXguE/nv2N8+fb5/VRG/60MIcUwrnqJog==',
        seed: 'OnBfl7rmqZ1UpaitehdxFwAhDPnvAFJ82su+DWLC14+raZBLhLo=',
        key: '4OORv7SVSRxOaMnaChB8y7NFxKE0gLlGaYhjIftFay3RGw49UfxYZaonrEh1jpEtpjyKG4fMWh8=',
        shares: ['8bNmOE00Bc8cK9Hsky0dUyDq6+dnvezYc/i4ssK06/p084QMUCZyeT4='],
        pendingShares: [],
    },
    {
        id: '11',
        name: 'rbc.ca',
        user: 'JevZH6qad9itbd3MUTy5dPvk/4q3J+e1EwTVTeXet3OxiwiJqaZllQHSeen23FFw',
        seed: 'U3KjAiYALY5it3LJ2Q2kEuHPFTKhwZG9MEzCCHwfQwI1XroJPgQ=',
        key: 'fTBEFji3lQYGh3n2//FfYQbVmcLI7tIDtligWh4SBcjBACZBP2VGfDDnhQQ9CLHd7C1NyPQf1IM=',
        shares: ['+iPZy/XAcUocPg/K8mKVvJybf1Zk9TNyBrl7f6z/QvW/5DR7QBr/5lY='],
        pendingShares: [],
    },
    {
        id: '12',
        name: 'apple.com',
        user: 'I4p+vvtbezKZBYvOHvdscxLRWatv51/iO3KhohOCqoPmx04bsFt34/fnjneu',
        seed: 'LC58lgPsyY46gA1deY04x44xi+F7wvGBfcSrG5tD2/UBDWTLugw=',
        key: 'wPDKMz4ERglqmaI9unIckJo/fC9fzTDQqwcUwWZpbnYrwoqBuAsYq7x9qcTNjAKJxboWZl/fEsg=',
        shares: ['fDJzdC/hVB7zt0d9rQta3gZENXl/RxTAGd3W7JuSOWE293ul2dcrGKY='],
        pendingShares: [],
    },
    {
        id: '13',
        name: 'gmail.com',
        user: 'uvEYsJV4JWhZASyC3NURn/SlQtk2r0H3MA9c1xPQNr8K+Z3d+NlrA86Yvk+1HNgZOEI=',
        seed: 'cLggEHSs+p0bYRv7Uqm7kfmVy9ac/sgNEwSMKbSfs713R8hz1g1V',
        key: 'w7EnL6LH36yRzE5qc7yowVWjgxE/tckuRrN6bodO88AJVixSRWkHJ8Ek2FYl6ERna0798lq6pIc=',
        shares: ['hERk/A3zqSbf7QNN7mPaRa9yWEZFAidRFW75JPpUvMK8MtK7vMAoZRo='],
        pendingShares: [],
    },
    {
        id: '14',
        name: 'linkedin.com',
        user: 'Ues5DGHZYE7WaSmsdBGpNd6ApBa9K2pLrOL4rL7hFCakUqMwgOBd5rS6I1c=',
        seed: 'F4+eX9+nr5xkQQD9lhyDSpsw4Gfu5yS2UTdw7ADQ1mrhYk2HSq4=',
        key: 'TaM6s23h2JS/c3lF3Tj3a8JtFfgVunRmeKqCysRt4u+ZPW7uUDSYWjlKorUVwlR1uhp6ST2MY24=',
        shares: ['L7I0gXZ4b/4qf5TGhyZBp3k7h939PLYTnR5XfH3HcZMHHwmQmGbDp2M='],
        pendingShares: [],
    },
    {
        id: '15',
        name: 'piazza.com',
        user: 'd8er5uOF++LkvQiY07tAKeJv3GsOfXDEAFdDx0sLlrqX09imHgCmcubiWPaP+CNC',
        seed: 'Hm5w++KjonuNsJKg4cGKzz8fRp8j5bn8eRxnYwYPo6bvNR2cDjI=',
        key: '4Phe4UiOsHuBpZenLsI5ifclCD2lrlS+ncTSRZQxw+Zznp+Urn/wcqRYDUqOF1hH1HZS66INGP8=',
        shares: ['BzSWdc8cQ9gMBFriQQJdwVIYDgrUm5xkqoaTpDDXSThK9MYUMWunhMQ='],
        pendingShares: [],
    },
    {
        id: '16',
        name: 'utoronto.ca',
        user: 'r3udvg06OKChUioGFPazsbXgVDs11rRahCzFsF2fuPS4RqL5aZm/MFhEnXdd',
        seed: 'DLQrFGni0YaYqfzzbuvJwQq19C8HNVq4Y/ae6fwsWsapbU8d7uk=',
        key: 'c+vZMIiDScIGJJU1rQjW7g5naUKlFfOCif1E02SDaPXCckFPOK+JFRVbmAb7L4V4BIsdkHFUr1A=',
        shares: ['1SS3FUeiEbvoHHNaZ3EQ6QABsJRtlOTA2BAn5SvXEpFyb63AmT6xQDY='],
        pendingShares: [],
    },
    {
        id: '17',
        name: 'ryerson.ca',
        user: 'GrdJtXQJd6tKsMCQ0NdvqZQVXhNkwRLdEX3Rm5K1fhgLfgdvKmuczYDMIFCkAhXxneptLg==',
        seed: 'fVXNoEN0USvOY4BNao+Pu6n9C+Z4SzystPXmbALmOq+1peNSUg==',
        key: '0hb2bKu5J6hulWuemQM9VriB76R2XgkeI6dOQBb9AVkbw87KXKmjdYx9X+f7N4m/HlGrFcRjbF8=',
        shares: ['6L+0GP8jLhZftroUCOLFFvtBRTWbKjqnPgC4/cr0yTjpUnWecH/HcSw='],
        pendingShares: [],
    },
    {
        id: '18',
        name: 'uwaterloo.ca',
        user: 'YVgewYm5h6kJbg0PO6xJmbDxW/FGuWTVod7hhklTIsQJRfg9jk+//QhD91PRLQ==',
        seed: 'pIsN2CR0ogAubTH1mdvuBSFSnxwbenkvoWyAewHYANFGNhIBbcM=',
        key: 'L5FaFVjVQXR+7KgpVw/sxo4zXUR+zA1O9VOq5xmJ4VCOZcE+SPczTL3axDm1nZgkrjlaGZ7336c=',
        shares: ['fYf5tBwZ8tAhW0c8lZLbdTrUWWS2QjcoGLZ8wuXFGbLAWbwPEZ/jzdw='],
        pendingShares: [],
    },
    {
        id: '19',
        name: 'ebay.ca',
        user: 'H3ZD31jG9WluNfmHtz27zPRODDzazGVaZH6FzTOhKdIjyxIeCYLo6MtMSvN3hdTospf03g==',
        seed: 't5QRL8DsB6eiJi6gdd5kYYAe7kycptD9PadEqfaskyKHyjKCHfY=',
        key: 'IwJGW/XebiKrHqZU75qjr4J3pETe2SoxSZrhBGcFnAHqwBU0fJkqPp/+WkMmP4kqLLW5W22mij0=',
        shares: ['0gZGU1xeFGbbK6Arx9kwgZdNU4Iy9DXtPqy8O+q50Q10rqiyUBmc9i4='],
        pendingShares: [],
    },
    {
        id: '20',
        name: 'apple.com',
        user: 'RL7PvNc6jynKfha19m/XXUA7kTO7Wqa4JF9cWsnwVnLnMRtBlt9Uap8bx6Ab',
        seed: 'r4Ka0EFGLy2NCYrevDQoIlcn7bqvaArL8Hv7pU7V69QKqVsSRkA=',
        key: 'OHe57AqmTSp10kEKMXVcORdDnj7Ibm29HHZkV0yhjbFFrU/zJuUUiJjODYBiK1uN8Tk0uYOKiOY=',
        shares: ['hb0ZhZ6FGfb9fyAa5a0Hb9diqPhTZyZnp5WZaXPdMpzwmhr8PbdzI6M='],
        pendingShares: [],
    },
    {
        id: '21',
        name: 'snapchat.com',
        user: 'Uquj/K5wcqHfZ/o5ITEqK3/bUnNN2d8Vh66rqqvKNuvQsM4MRAGzrXl5sRLFYiynCQ==',
        seed: 'X8PbfpF2ggzm/I2NeGztFdvKOQFmUBXR9yla6xwJAUSSLs8dTwY=',
        key: 'h61xr4SNFtt3cDFgkC6BHmI/r4JxOgkd8YtXVcyU/wQxRflqk+8aS5Kgt11fF8zHqQdHKfvjYfA=',
        shares: ['zx4UkuiMzmhWAuTzed2Yuy3K7qws7vEdL0bonhKZI/345kmFatodZK0='],
        pendingShares: [],
    },
    {
        id: '22',
        name: 'etsy.com',
        user: 'y4yeif0bSddtM6rAmZ8+ykLW7l/XY9TEbWqitxZJCXAIrXUSiT998ausYpSlLNZ74839lg==',
        seed: 'syWItbAY/zJvDWbv+x1VVyi1fKzOdbI1/6CYjl+m+DxYIGA6XeI=',
        key: 'rGKJzJPdpbKEjoH5QhECF9zBr9oUYXiLHvhYGB6+cwvq1U8awYgbS7G5OvKZmcKleqg7ChAozSc=',
        shares: ['PDqdRDadGygJsy4yq2/2oveuz1E0N8Ny056ifsQ7+g0NBDVfKTVJqqA='],
        pendingShares: [],
    },
];

type MFADto = {
    id: string;
    name: string;
    user: string;
    seed: string;
    key: string;
    shares: string[];
    pendingShares: PendingShare[];
};

class MFAService {
    private cryptoWorker: typeof CryptoWorker;
    private masterKey: string;
    private masterEmail: string;

    private async createEncryptedMFA(username: string, seed: string) {
        return this.cryptoWorker.encryptWrappedData(
            [username, seed, this.masterEmail],
            this.masterKey
        );
    }

    private async decryptMFA(mfa: MFADto): Promise<MFA> {
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
                    mfa.user,
                    mfa.seed,
                    ...mfa.shares,
                    ...mfa.pendingShares.map(
                        (pendingShare) => pendingShare.receiver
                    ),
                ],
                mfa.key,
                this.masterKey
            );
            key = decryptedKey;
            user = decryptedUser;
            seed = decryptedSeed;
            shares = mfa.shares.map((owner, idx) => ({
                encryptedValue: owner,
                value: decryptedShares[idx],
            }));
            pendingShares = decryptedShares
                .slice(mfa.shares.length)
                .map((receiver, idx) => ({
                    shareId: mfa.pendingShares[idx].shareId,
                    receiver,
                }));
        } catch (error) {}

        return {
            id: mfa.id,
            name: mfa.name,
            user,
            seed,
            key,
            shares,
            pendingShares,
        };
    }

    private async checkMFAExists(url: string, username: string) {
        // TODO: connect to real api later
        const domainMatches = encryptedMFAs.filter(({ name }) => name === url);
        try {
            await Promise.all(
                domainMatches.map(async (mfaDto) =>
                    this.decryptMFA
                        .call(this, mfaDto)
                        .catch(() => ({
                            user: '',
                        }))
                        .then(({ user }) => {
                            if (user === username) throw new Error();
                        })
                )
            );
            return false;
        } catch (error) {
            return true;
        }
    }

    constructor(cryptoWorker: any, account: Account) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.cryptoWorker = cryptoWorker;
    }

    async getMFACount() {
        // TODO: connect to real api later
        return encryptedMFAs.length;
    }

    async getMFAs(offset: number, limit: number, sortType: GridSortDirection) {
        // TODO: connect to real api later

        return new Promise((resolve) => {
            let mfas = encryptedMFAs.sort((a, b) =>
                a.name < b.name ? -1 : a.name === b.name ? 0 : 1
            );
            if (sortType === 'desc') mfas = mfas.reverse();
            resolve(
                Promise.all(
                    mfas
                        .slice(offset, offset + limit)
                        .map(this.decryptMFA.bind(this))
                )
            );
        }) as Promise<MFA[]>;
    }

    async createMFA(url: string, username: string, seed: string) {
        if (await this.checkMFAExists(url, username)) throw { status: 409 };
        const [encryptedKey, encryptedUser, encryptedSeed, encryptedEmail] =
            await this.createEncryptedMFA(username, seed);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async deleteMFA(id: string) {
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }
}

export default MFAService;
