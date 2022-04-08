import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

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

/**
 * Controller to communicate with the backend in all MFA credential related functions
 */
class MFAController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    /**
     * Creates a MFAController to communicate with the backend
     * @param client the GraphQL client used to communicate with the backend
     * @param token the user's JWT
     */
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    /**
     * Sorts the records by sortType, starts from the given offset and returns
     * records up to the given limit
     * @param sortType sort direction
     * @param offset offset
     * @param limit limit
     * @returns a promise resolving to a list of MFA credential data
     */
    getMFAs(offset: number, limit: number, sortType: string) {
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

    /**
     * Searches for all MFA credentials given a URL/name stripped of seeds and ownership
     * @param name domain url
     * @param exactMatch whether or not to match the domain exactly
     * @returns a promise resolving to a list of credential data
     */
    searchMFAs(name: string, exactMatch: boolean) {
        return this.executeQuery(
            searchMFAsQuery,
            {
                name: name,
                exactMatch: exactMatch,
            },
            false
        ).then((data) => data.searchMFAs as MFADto[]);
    }

    /**
     * Counts the number of MFAs for the current user and returns the count
     * @returns number of MFA records
     */
    countMFAs() {
        return this.executeQuery(countMFAsQuery, {}, false).then(
            (data) => data.countMFAs as number
        );
    }

    /**
     * Attempts to create a MFA credential with the given arguments
     * @param name website url
     * @param username username for the website
     * @param seed MFA seed for the website
     * @param key key used for encryption
     * @param masterUsername username for the hexagon user
     * @returns id of created MFA credential
     */
    createMFA(
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
