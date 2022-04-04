import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

const countCredentialsQuery = gql`
    query {
        countWebsiteCredentials
    }
`;

const searchCredentialsQuery = gql`
    query ($name: String!, $exactMatch: Boolean!) {
        searchCredentials(exactMatch: $exactMatch, name: $name) {
            _id
            key
            credential {
                username
            }
        }
    }
`;

const getCredentialsQuery = gql`
    query ($offset: Int!, $limit: Int!, $sortType: String!) {
        getCredentials(offset: $offset, limit: $limit, sortType: $sortType) {
            _id
            name
            key
            credential {
                username
                password
                owners
            }
            pendingShares {
                receiver
                _id
            }
        }
    }
`;

const addCredentialMutation = gql`
    mutation (
        $name: String!
        $username: String!
        $password: String!
        $key: String!
        $masterUsername: String!
    ) {
        addWebsiteCredential(
            name: $name
            username: $username
            password: $password
            key: $key
            masterUsername: $masterUsername
        ) {
            _id
        }
    }
`;

const updateCredentialMutation = gql`
    mutation (
        $username: String!
        $password: String!
        $secureRecordId: String!
    ) {
        updateCredential(
            username: $username
            password: $password
            secureRecordId: $secureRecordId
        ) {
            _id
        }
    }
`;

export type CredentialDto = {
    _id: string;
    name: string;
    key: string;
    credential: { username: string; password?: string; owners?: string[] };
    pendingShares?: { receiver: string; _id: string }[];
};

class CredentialController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    public getCredentials(offset: number, limit: number, sortType: string) {
        return this.executeQuery(
            getCredentialsQuery,
            {
                offset: offset,
                limit: limit,
                sortType: sortType,
            },
            false
        ).then((data) => data.getCredentials as CredentialDto[]);
    }

    public searchCredentials(name: string, exactMatch: boolean) {
        return this.executeQuery(
            searchCredentialsQuery,
            {
                name: name,
                exactMatch: exactMatch,
            },
            false
        ).then((data) => data.searchCredentials as CredentialDto[]);
    }

    public countCredentials() {
        return this.executeQuery(countCredentialsQuery, {}, false).then(
            (data) => data.countWebsiteCredentials as number
        );
    }

    public addCredential(
        name: string,
        username: string,
        password: string,
        key: string,
        masterUsername: string
    ) {
        return this.executeQuery(
            addCredentialMutation,
            {
                name,
                username,
                password,
                key,
                masterUsername,
            },
            true
        ).then((data) => data.addWebsiteCredential._id as string);
    }

    public updateCredentials(
        username: string,
        password: string,
        secureRecordId: string
    ) {
        return this.executeQuery(
            updateCredentialMutation,
            {
                username,
                password,
                secureRecordId,
            },
            true
        ).then((data) => data.updateCredential._id as string);
    }

    async checkBreach(hashPrefix: string): Promise<string> {
        return fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
            method: 'GET',
        }).then((res) => {
            if (!res.ok) throw { status: res.status, errors: res.text() };
            else return res.text();
        });
    }
}

export default CredentialController;
