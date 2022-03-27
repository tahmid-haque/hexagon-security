import { Credentials } from '../components/credentials/CredentialsView';
import * as CryptoWorker from '../workers/CryptoWorker';
import { v4 as uuid } from 'uuid';
import { Account } from '../store/slices/AccountSlice';
import { GridSortDirection } from '@mui/x-data-grid';

const encryptedCredentials: CredentialDto[] = [
    {
        id: '0',
        name: 'Apple.com',
        user: '94RRF1d0XaSvsncSlvpb8NHPhRsqHv8JQZYR11GOfccmhRT+NNh5P13Vq0g2',
        password: 'AFqmV2XHyCQEtXO6iSpZm6rnnmEi9xQ9UNPkW2WkJSBXnj/tsuf0',
        key: 'XYibVjrniOPK0EivwnmgZHjwVXY0476GK/pjqxkbIobmOI+iRLXlLzIVYIPZErcJuHmJpdCyHTJ3cPCID9pM/dPUj1LIXc2Hc42xxduKWw1KK+IO+ZnBLWOu2xl4ia7YOk3KV+Iz7pkvkgQT/9abcIobinK9',
        shares: ['xxuhmluU6nzcuqf+B0tsFasDLMPKjI72l2jOTZwDsyt8cHQ4I3ftwRE='],
    },
    {
        id: '1',
        name: 'Amazon.com',
        user: 'zUk9QsFYGmyz038paehNAW5ror4BedDgmXj4em0cJUzDIakW6vAUhKSV6l8dZAojH83jFw==',
        password: '+Truy1a4OaiKeRhaXK83IIm3G3cA8sndEfhqju5MlmrKQKBZOnnD9g==',
        key: 'x01qQkz1X1YjZu25nljqsFLEprxyc6oIHsh7jtSxXX8p4jq+KpMM62cf83f7OZ3Mcnts4HVKmtSAhpMZotT/tk2FAFIthKPbG8zd3EegXq5zXoP9vyoZUhrBDoLOKtmbTPbeQA4EkXYXbeezClXeMw==',
        shares: ['/XhCq/evscGhdeZHcV9ELuBGxrj0nPot9Awc1u6287ejSX0iMZO+ooM='],
    },
    {
        id: '2',
        name: 'Twitter.com',
        user: 'Ftic3Z8e6FqLCoYKOhdtTXyYA0GeCcG8mumiYYBycE9mpHsMVdvhZgjb/CkUr9+4RA==',
        password: 'lewmas0XxFhYS60dPgip/0woGJ2lrVplxvKNwo45DJ0j1rENEfZ48aY=',
        key: 'KQ3w3UzjxYPu5ihn+b9ofQpxQ9r9wc2SSmlktQ3U9bKK10tLyZL5ohYVSV2AbyTWnzeUkn3hoTl4RZ9Z+tRwzN34PeY4lq7E1Y2D373Igy14/u1DdinRugJu97FqzX9/lincepAp1dSTdCWOK9UXTHzgVMM=',
        shares: ['0Bq/Z+wWx0C+o3H0OECv5nx9IjdLDL8VP2QjpJKDuf0qXeLAAMGtSII='],
    },
    {
        id: '3',
        name: 'Facebook.com',
        user: 'h2GHbeC9yr+jBSvSvcZAar7VrYEkkA4UuOz4D2e2vtJyUcNy+cYD+Xwyp8uV',
        password:
            'yyF3Lr6J6oc7SbG15low5DagNd9uAgXYXtfbFiaQvir2LctgIGgPhPewJQ==',
        key: '1ety+UKbrZcPeK7NroWFmDk79zz/CkHwSfI8pYfsNOPj9GMkogZr8ZGGKiIVPXZhB769vtwL7HgmYddm/sIuih+ud5B2u86QMazdhVuMvBgI8GcQa8cjJXmkVOCe8YLm2Nbr2ExkrNgcFsmOGEzU',
        shares: ['7ZvMHobD20yByb3BvorXWk9EGhqUg7UppqMhbxD4ZIxx7hIIuCRzv6E='],
    },
    {
        id: '4',
        name: 'Instagram.com',
        user: 'WWD+9Wfml4YbCexgGhzeYk6xR+63PHhEbIHCh2uK9RMmyfAtNDtdTFHZOzfNgaU=',
        password:
            'zg5+lVi/KBGW0m1erSwCYKyKAty52Z09rEzq1pMidmnOBoTy5Ezy1/g/R0jc5A==',
        key: '13bqQWMF5Qj/6jXeI0f7IDTQexUKa1Bncmj3lhjFXWGv3D4H52gcTOC/MWydFqr1Lg2s35k0trDd56ZbSSvpQd2OVB+zcHneaEwLyS8/OywsyosLLBBXuraL/lYUsZ6qrBDVBOzhkWrsHMjXfc72W1ATlw1Dvg==',
        shares: ['CTFdTxDD0fs4m4GZK5AXC3zn9TnJJqhnHvrv/xdoXz89vzYwxFB7rns='],
    },
    {
        id: '5',
        name: 'Reddit.com',
        user: '7iPU02ZjNus/mzwk4XIHxYob9bhestHHESGICn/sH4HEKYrJsRHxuhzIsWsprEcnmypo7givqA==',
        password: 'RaoPPrPKLlHqdkFH2oiHdX/zz5hCu0OLm+0htgXVXHyuEippNwQ=',
        key: 'B06qaVlWXTVtSF03GSXg7BoNj7pbmFYEeImD/5PqIuOPX7ar4iDNcXsFG8TQzwzidLKoUn8bC70+hiwUbsaoxfI1v0mGMFcNapbhWCQVa5T/huVUWIWvmKh2pOSbKR9Q8SKyNCauHYLTtCj0AY3GJB+19ipt',
        shares: ['RsqmdxwqIctqSFmrfkOvfTcd3lCx56BQzPi2arfzd3Ielk5tKM9pRjE='],
    },
    {
        id: '6',
        name: 'yahoo.ca',
        user: 'PhuUzFnGm8uGcc/ESpslRhyqppHIbtLqan2zdCtjDAVy5wAdNtugx7Pd3IjPTI6JOA==',
        password:
            '0n4rfLvE6Wc0pRO6AgjmTddc9zLfB7KH8avpoGcGPTrEC9cw3M9l2Tn3LVs=',
        key: 'RnX1s3dwB/8imPO2DxU+r/1Dp/Xn/POYq9OtbDr3jh2srCJUmc5IU78SWlYtt5HFeCG0DzSuF7BwUL9SHVe0DNyCDEzYleKrEZ+mLdHwRJatvmd+JIJxGEuTiOTUbFzrTWgSXqu/YqxOKSHpuLEHUT/s',
        shares: ['LO5JP7sk91uzF30/GUEaDyvXpnjv5vkPaYAuIZ+9Eg8VadUnsNfiUX4='],
    },
    {
        id: '7',
        name: 'msn.com',
        user: '4fqGDPp/Ll8bq9Tv0dgzv6YkEU8oKcsvCmKII52ZMaYzykBZUNMXz3zZiRKQlf4SutqE',
        password: 'CoWcbKezqQNK7INr2v85efxeqUtEP6rEEcidhDBuzTMTcOnPAK97hw==',
        key: 'pohXreWY3DhtpsKosILc5toG/6pHD+is4SaRlD2evStvgr3iqjDY0u32ccCEOzCuQ15+VeY10w2lD48SqlEZWR4hoEabvzMOXR2FYLTr1CHDN+z9HhsWr6o1ktQVb0Rc0xrucz/OFhN7Jaxy5Afryy1dHYQ=',
        shares: ['X/F/sTAEcXM06MlziStb+pb8zQum6TR2a0O488QoutKl9+MgYSE4CuM='],
    },
    {
        id: '8',
        name: 'yelp.com',
        user: 'SIt9ryxk1LVq/dqKiEy97tScCdwUNLtrmo2BRUG94yzHV46js68tHs1EL7B8',
        password: 'eaZ+nBVNXQ8Xmrsp412uGwpPFOO5pdBYvpEnI8ONrknc4Ha83ChWShq9',
        key: 'CXuNTgRNQkuL4KXc7mZJeN0y/QmU2mhk60G20XQGAoAM0Tv0ABZNzN4qAMh0YGd3iHqGWtmruHJDjIGx176M3umnrBOjXXyG/iIFZn0XNwtyqJtc2kRspN+3m7P7KVi2bAoLYmzTdxg2zdLmC86OaEoFwLsoVg==',
        shares: ['KlaeifM6olGyCJhinJ/vrrGcrppfDxW26K3brffP38YOsote23uatWE='],
    },
    {
        id: '9',
        name: 'youtube.com',
        user: '+svZ8erSgm4ARmQ5Df2UHZh31yFOAACwGgWLMAliKUAf26yBN56YakrqYWqzwSKO5S+jVcQ=',
        password:
            'irfUvtUBVUSS6j2xAO8tLwjRb6qMDpGvMSI2JhOnLmKptVb5KJuBxu5FtKxrSw==',
        key: 'gpMoVTMbUfO2Pf4wy+DPVKGhp9bnI/zevq6UW9cEvzBoIw/xXP1p+sX7GOA1IJ8Y90cM1SA9a0Vtdtq22F5z9Uc/HIgl9Dct60lPLw+wqq4AxcqHkT2vvq970vdDvOAlEufx02TpC+YWWko5u0X24uVqCU/AdQ==',
        shares: ['TcomTV3scXXXrOIxBa3qGcUdMdO5Rwic6ZA+JoovBrqYPag3wZ/olSQ='],
    },
    {
        id: '10',
        name: 'Google.com',
        user: 'hGLJ3LrzUNwB2Grzrk8cw1zwBsz7zkqhQEjl9BoiHrTaLlgfXLIvFQVXznTjasJdbw==',
        password:
            'cItns9r9ijD4b82rOhJHUekRwDKaTQnE4b291aNzJR69I1LEzd5QW/8ZKmBi5i/c',
        key: 'qvYDsmXr6W0xZErjjLNUKVUhfrMcok4+/eVhMlMeEK4hOmB/nOrrvWOSHaqrynSEba0bx5zot2dtKv+dJbV/R7ihHnrNVtTYILEwGo68/uX3YiR0irUFvM/4HdN082nsl2seQfXJuya9lwwAZekkzKMzqg==',
        shares: ['PlvBD42+B5rls5dekyrVInOcaWVGyfzS8t8v6dJ+pzSNKj/91k/sDZg='],
    },
    {
        id: '11',
        name: 'rbc.ca',
        user: 'yfhEU2AfioPKTd9raZyEYpxDr9wnZGqqReX7D2raMN7H9CSEwV3ffwyPdhT3PsUm',
        password: '28yie/hyACfJs+mYU1+7YyVBRbiXWxV4tnQIdrOEBt8dB3Ho227c6ZO0',
        key: 'd3fzHY33S9v18WWeHMm6gGFrV3RO8cTzgkq50MQ/EiGfnBLUlXRbOmjpCgTu4nVKAMsXY+P6ZRvVlhT/nojqwFqkPMzO52ewCGac54zuuNZBoDvP8WBPXq4ysjIdiDp/5uhMLgqhjedY+faiF+jm1+NW5fzb',
        shares: ['OL/cz830MBAKnXmSxs2lLUnYNmk8S0Ts/OzyTr44IL+KntpPR0doD1Q='],
    },
    {
        id: '12',
        name: 'Apple.com',
        user: 'E2YbznQda3HSFZx2ceaW2PF7wLZGyiVQlOYA+RNW0A4kWnYYPzVSUwnWz5Ju',
        password:
            '4JNqV7nOFdy+T4dJE12oqVUgIlpfqzeLMMw0s7UFuAhVYLaHBfHO0xpwZSk=',
        key: 'o/fI6ASnHLeQ9hGETSQLm8IFoWABGAUlzYn5WdWKpL3H1P4lVKb37lptJomco2uImEwHn8Vc+jNDMY4meMIHmAFHQVBvem7nnqGP1zR2qbCKnAMAaDX3rOI5ykBMxxKxY0GZoZIJs6ybiNP2M3aSHx7K',
        shares: ['tang8ZrVNBfcc683i1nOyimJznHsRTn6btZ/1deUmAjvHtnJuF2o5AU='],
    },
    {
        id: '13',
        name: 'gmail.com',
        user: 'c3SHvRZ9ZDKD/Xvv0plTfFNfksxTm7RgZQA1cpTtWSwEmEj4e57zgR2cTmZ7MLmq7aA=',
        password: 'IF22NdyhUIj78yjeAt7OI+s8IQdCwDN3CkLiRL3il91g606oP4Is',
        key: 'thCHPWmB/JyZcKh7c83Yj4h7BC3IhpngfO22DgQxp0Ql6+yOl4aDDZPenC/yzCilLScKZkwNOCUTvlwA8ry4ZKHOY8sxabRFB76qpp4sqStX1q/k8txoNZMfbxMvC2hgl/H3eV4SKGICTEN9wHHUAcpVa6CJ4g==',
        shares: ['jhTOhGJ59+KvizvQWO1VTGMQJ7yeS0j//OneqTFhaXb90loV/8FJ8x8='],
    },
    {
        id: '14',
        name: 'Linkedin.com',
        user: 'pt4j7h3hlSdMEWA/kLN/hBC+CFvp6pgK6GnJT3HZoTfr6or/UC8CAs7UOS0=',
        password:
            'D9yAPRq6BKX34iQfH56yn3V+sBK1oQ/5dpaROItORB3wJDlDT7/SQSWoLPQ76/Glw4AOWQ==',
        key: 'TCABzGAvnY9FzwgrRkx+dCOfG4dYL6Lr0wR+XcirC1UHHIzv9VseFSxOpKFYNDk3ALs+ed8j6nQJ8Qt+RDkgI8yaHK23CBSebkxPhoQ3TIzCkl0CCVtPn3mRRCmzHiFMbTqVTvSr+mYAc0vVQ09Sd9+p1g==',
        shares: ['hblfgZoL5cPLv5VoPZoqRwio8qRTy1ZYYX42kCFcX6Zd5awCRYSzXXs='],
    },
    {
        id: '15',
        name: 'piazza.com',
        user: 'q+xuGx/FM8oN4mBa9fw35mb1AvWmXvYdc7uHB2Zd0OqjpdO/lOujSLJZPk5hYeTF',
        password: 'OY82c7BMvNrBvq7xfwr37iK14s0KqCb4WRdtcDD6zbMWb4aqAdbnn12E',
        key: 'zV9K7dfnlIOG5EkckJUcsO+K1pg2yV++Jb54WmqHpAMINq6pz3vjqQdVu13+5ZQ84ZsQQHk2WicfIjZpu0dRS15zUR60OebWLUIWdeFteJZFOKPMwp6O3O6m79tPrO7iD4IXs3bV3m1FG2nySQVYXMVwqx8=',
        shares: ['WWUCqnk3edm6qTywzELdM29XW/8Mbs8B0iuMTot7VGjFS0ABG2AtGh0='],
    },
    {
        id: '16',
        name: 'utoronto.ca',
        user: 'FbYzS6aK6JJ/FS8jcv83GjdcYgG4O0IHGYS0Gqxjxa4j17uFHY8I17/X9uHH',
        password: 'OeS9LD9EWpUNywL2oO4oNBZ/9m5UUvaVhrRsUcZQAlpUi0Dyczt0',
        key: 'o+6EFawaguRz1u5exmvdhp4MEd8rezRvDwJrWpsz/pNM1dqpDL9ZOL6T9/aR53GD1fSFq2yAn8CtDY5BgRNOPBb3fmVkDr66e/fz2NA8F4sHBa8SH88048Uj/ZLLnsXCT9x8IuXTI6qh7G/95zgKlsYDS1DW',
        shares: ['/MjAVsvdMzdX9nLL4VhOe76RBaqVZv8JFAb5S5l9pCq1HaEuDwDQd28='],
    },
    {
        id: '17',
        name: 'ryerson.ca',
        user: 'XaV3PlwVq+UVEz2d1DqJntk5p8U6tFwb8mtBlwWhfrypswA8AIE/94QdIlHvfGoVyosnrg==',
        password:
            'UTW+C/JoHcx5gKbn4fSmhpXfjS1Y43yKlSUrSLKT3HSp73176tOQu9BQBnFS4w==',
        key: 'Ub3zLE8NwBN97BSy3VBoZ5WJ1l3NSVxztjBsasbodGsf9wyGPu9pmeNlSoCymYhEI/wrkZbVuNb1iC+zV70J00pK96ayCDd96+4eiaFa+uGvZqWB5i280wEGwFEYTyuaDrl4QLFgL+l8zTWI1qe07xIyoso1YA==',
        shares: ['lqmo193c7ngNc6G0h1hdkgxE7V6PF5lUPYMa1cLEQQEyKIrBvsZmfi4='],
    },
    {
        id: '18',
        name: 'uwaterloo.ca',
        user: 'znujnRdOXKKKIt0o4ozAITRpHVEpiTo42md0LTAv4LdNj2nM5FjA6/V9KzvGkA==',
        password: '0m8rSoVbeZUmA9zGhWQQnkSrOmcrh7+LQdngohdaC3lljZQqvBOX8mim',
        key: 'QtI9RTAwPpzyH1tHwPQZ+c/eFKVs8GgPkXFF4zjYYiMQTaIhKiE7GcMHioy2pVO9N/T0b8U5WQVfBtFcx14kfbmekglv7PT4VnCYWnyZv0UCOGpDIQtLPPdYJaOjOz93yaA1g1Kucwn/FdnamgDYXCFQ',
        shares: ['OJHSEafat5IMWovaixJ0e3nba+FNLc1abTDH+c6GZTLNm7pmePfTKvg='],
    },
    {
        id: '19',
        name: 'ebay.ca',
        user: '4Z/Fp2D9yL14POdIftK+dTa3ALmf/JbFd1f9XHfp+08vCCHDclXqJI8mK8QDOLYaCMKEDw==',
        password:
            'V/+QvpBxxLWKMvDRKDFvaYB+9XnVA10LBCdRc60Jdp7JTbpqUxnL/ffEttNN33pPlbMIJU4O',
        key: 'h4UkFxS/OJSPEBRDH5kuBqu5JWbnuC2pqpcfdUhW8mKM2A/IfLUTk6sysOeaxV1JqkwMONCOJ2ktj7taYkIVcox5p4hf/F52wEnvcAm9bv9AixqdpK8FMqeqpJzdmLBsb/VWO3zDuhuby/TCWsBF5Y6xAeVIKx4=',
        shares: ['vnlcEbvnBYqZclbr9MJ3Jwr4U1A6Y2ZrmfYBCr/ZRWYlJOuxYPdG/Jg='],
    },
    {
        id: '20',
        name: 'Apple.com',
        user: 'DfI14d41fdCbat8B+obzE3u6IniA3QWsPyRUcNpSrpvZaQRwZdAIgCg/1RWU',
        password: '2LyaXGPttmZOmSYaCiv6FjoaT2iCS11zPQuYx7RisnUiz8OEAKHh',
        key: 'AoXwtreegY48R90k6/1pyN+Z6Wfiwkf7yaNH/LYxmLsvIyC40f+2cwPsxbpWOTRKBqJ1DB4Im7p7Th5S2vyDVCaN88ki87uyeH59Y+Tz1Zc0RZ8qy+SYRuhmlErp8L5hHLNQKleehX1G6eZ8yG4A',
        shares: ['aRlx3/VV35dXZ1SEaRVzUdC1iSi8Dzz/EdvtrP93CcCc1rfp9buSC5M='],
    },
    {
        id: '21',
        name: 'snapchat.com',
        user: 'akLPFWKjuJhNxEt35OSjUIcnXW0VsMyQsaoQHn520pNNYIHBtgup9MpggJ/45KA0Vw==',
        password:
            'zH2hPuhgS9ooLJmhmJaFuvG5npMS1ZdO7kZlaTILd2CuhMi0dvazuKfoyYCtNh8PCw==',
        key: 'sH3nXMqJFbd9Dn8mjTeHdsPAsneF9j0HNjWYJWjzAnb6iZfJZEtoMVnjYIhJmcbPO2swp3Z9+TsRALZ5YzvpBPf0ijPYQZqQ8U7jVQZP7TvGH+CVnNmJ1WmyCyBoaU/OEKrXUGic1otFLMCAas8CEwa2',
        shares: ['LSFY2X4Yp37UMB8Ikx0h8n5/9tkzeJl0tO+2wX7F3V/+ndUkWGEVqHY='],
    },
    {
        id: '22',
        name: 'etsy.com',
        user: 'xatYubHi+66hiue9S654NTw2Jjxp+2Fp2tglqoJ3Pe4WYZ1Et43pQlTLd5fVzOBvF5VHoA==',
        password:
            'yE0Fog/o8eWWLrYQvcUV1gVVvHU4nUCDJii8cJPvKbcfLoXM5LlcI3jDleDgNcTz+v3TOA==',
        key: 'pCP/dEnBexi6b5sufCvqgY99LZ/RJKlYzZ2kvkcIZJnCDtF+QSaj0XDDE8rmuIwSNMhUY9dVSuyoWPGevma28+XmFCat6yngkUZ1JUs780r6D3Rm5yYstP+Tg2hSWd6nCTH5LrfawZulibwOdqDquLZ/PmyTAq8=',
        shares: ['0RTNrIDlG19QHVqRK1QAknelhK8Vs32GrziIfL8ofQNAIQN5AHjIYGs='],
    },
];

type CredentialDto = {
    id: string;
    name: string;
    user: string;
    password: string;
    key: string;
    shares: string[];
};

class CredentialService {
    private cryptoWorker: typeof CryptoWorker;

    private masterKey: string;
    private masterEmail: string;

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
    ): Promise<Credentials> {
        const {
            key,
            plainTexts: [user, password, ...shares],
        } = await this.cryptoWorker.decryptWrappedData(
            [credential.user, credential.password, ...credential.shares],
            credential.key,
            this.masterKey
        );

        return {
            ...credential,
            user,
            password,
            key,
            shares,
        };
    }

    constructor(cryptoWorker: any, account: Account) {
        this.masterKey = account.masterKey;
        this.masterEmail = account.email;
        this.cryptoWorker = cryptoWorker;
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
        }) as Promise<Credentials[]>;
    }

    async createCredential(url: string, username: string, password: string) {
        const [encryptedKey, encryptedUser, encryptedPass, encryptedEmail] =
            await this.createEncryptedCredential(username, password);
        // TODO: connect to real api later
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    async updateCredential(
        username: string,
        password: string,
        credential: Credentials
    ) {
        const [encryptedUser, encryptedPass] =
            await this.cryptoWorker.encryptData(
                [username, password],
                credential.key.secret,
                credential.key.salt
            );
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
