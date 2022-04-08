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
class MFAController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    /**
     * Sorts the records by sortType, starts from the given offSet and returns 
     * records upto the given limit
     * @param {string} sortType ascending or descending
     * @param {number} offset offset
     * @param {number} limit limit
     * @returns {any} list of SecureRecord data for MFAs
     */
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

    /**
     * Searches for a MFA given URL/name, if exactMatch
     * is false then returns all secure records containing the given name
     * @param {string} name domain url or name
     * @param {boolean} exactMatch boolean value
     * @returns {any} SecureRecord data for MFA
     */
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

    /**
     * counts the number of MFAs for the current user and returns the count
     * @returns {any} number of MFA records
     */
    public countMFAs() {
        return this.executeQuery(countMFAsQuery, {}, false).then(
            (data) => data.countMFAs as number
        );
    }

    /**
     * Attempts to create a secure record with the given arguments, returns
     * the newly created record on success
     * @param {string} name website url
     * @param {string} username username for the website
     * @param {string} seed MFA seed for the website
     * @param {string} key key used for encryption
     * @param {string} masterUsername username for the hexagon user
     * @returns {any} newly created record data
     */
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
