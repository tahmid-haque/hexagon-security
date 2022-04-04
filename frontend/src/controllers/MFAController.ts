import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';

const countMFAsQuery = gql`
    query {
        countMFAs
    }
`;

const searchMFAsQuery = gql`
    query ($name: String!, $exactMatch: Boolean!) {
        searchMFAs(exactMatch: $exactMatch, name: $name) {
            _id
            key
            mfa {
                username
            }
        }
    }
`;

const getMFAsQuery = gql`
    query ($offset: Int!, $limit: Int!, $sortType: String!) {
        getMFAs(offset: $offset, limit: $limit, sortType: $sortType) {
            _id
            name
            key
            mfa {
                username
                seed
                owners
            }
            pendingShares {
                receiver
                _id
            }
        }
    }
`;

const addMFAMutation = gql`
    mutation (
        $name: String!
        $username: String!
        $seed: String!
        $key: String!
        $masterUsername: String!
    ) {
        addSeed(
            name: $name
            username: $username
            seed: $seed
            key: $key
            masterUsername: $masterUsername
        ) {
            _id
        }
    }
`;

export type MFADto = {
    _id: string;
    name: string;
    key: string;
    mfa: { username: string; seed?: string; owners?: string[] };
    pendingShares?: { receiver: string; _id: string }[];
};
class MFAController {
    private client!: ApolloClient<NormalizedCacheObject>;
    private token!: string;
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.client = client;
        this.token = token;
    }

    private async executeQuery(
        query: any,
        variables: any,
        isMutation: boolean
    ): Promise<any> {
        const execute: (options: any) => Promise<any> = isMutation
            ? this.client.mutate
            : this.client.query;
        return execute({
            [isMutation ? 'mutation' : 'query']: query,
            context: {
                headers: {
                    jwt: this.token,
                },
            },
            variables,
        })
            .then((res) => res.data)
            .catch((err) => {
                const error = JSON.parse(err.message);
                error.status = Number(error.status);
                throw error;
            });
    }

    public getMFAs(offset: number, limit: number, sortType: string) {
        return this.executeQuery(
            getMFAsQuery,
            {
                offset: offset,
                limit: limit,
                sortType: sortType,
            },
            false
        ).then((data) => data.getMFAs as MFADto[]);
    }

    public searchMFAs(name: string, exactMatch: boolean) {
        return this.executeQuery(
            searchMFAsQuery,
            {
                name: name,
                exactMatch: exactMatch,
            },
            false
        ).then((data) => data.searchMFAs as MFADto[]);
    }

    public countMFAs() {
        return this.executeQuery(countMFAsQuery, {}, false).then(
            (data) => data.countMFAs as number
        );
    }

    public createMFA(
        name: string,
        username: string,
        seed: string,
        key: string,
        masterUsername: string
    ) {
        return this.executeQuery(
            addMFAMutation,
            {
                name,
                username,
                seed,
                key,
                masterUsername,
            },
            true
        ).then((data) => data.addSeed._id as string);
    }
}

export default MFAController;
