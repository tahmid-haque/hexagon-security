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

const searchWebsiteCredentialsQuery = gql`
    query ($name: String!, $exactMatch: Boolean!) {
        searchCredentials(exactMatch: $exactMatch, name: $name) {
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

    /**
     * Sorts the records by sortType, starts from the given offSet and returns
     * records upto the given limit
     * @param {string} sortType ascending or descending
     * @param {number} offset offset
     * @param {number} limit limit
     * @returns {any} list of SecureRecord data for credentials
     */
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

    /**
     * Searches for a website credential given URL/name, if exactMatch
     * is false then returns all secure records containing the given name
     * @param {string} name domain url or name
     * @param {boolean} exactMatch boolean value
     * @returns {any} SecureRecord data for website credentials
     */
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

    /**
     * Searches for a website credential given URL/name, if exactMatch
     * is false then returns all secure records containing the given name
     * @param {string} name domain url or name
     * @param {boolean} exactMatch boolean value
     * @returns {any} SecureRecord data for website credentials
     */
    public searchWebsiteCredentials(name: string, exactMatch: boolean) {
        return this.executeQuery(
            searchWebsiteCredentialsQuery,
            {
                name: name,
                exactMatch: exactMatch,
            },
            false
        ).then((data) => data.searchCredentials as CredentialDto[]);
    }

    /**
     * counts the number of credentials for the current user and returns the count
     * @returns {any} number of credentials records
     */
    public countCredentials() {
        return this.executeQuery(countCredentialsQuery, {}, false).then(
            (data) => data.countWebsiteCredentials as number
        );
    }

    /**
     * Attempts to create a secure record with the given arguments, returns
     * the newly created record on success
     * @param {string} name website url
     * @param {string} username username for the website
     * @param {string} password password for the website
     * @param {string} key key used for encryption
     * @param {string} masterUsername username for the hexagon user
     * @returns {any} newly created record data
     */
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

    /**
     * Attempts to update an existing credentials record with a new username and password,
     * throws an error on failure
     * @param {string} username updates with the new username
     * @param {string} password updates with the new note password
     * @param {string} secureRecordId points to the note record to be updated
     * @returns {any} newly created credentials data
     */
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

    /**
     * checks for any breaches given the hashprefix
     * @param {string} hashPrefix hashprefix
     */
    async checkBreach(hashPrefix: string): Promise<string> {
        return fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
            method: 'GET',
        }).then((res) => {
            // eslint-disable-next-line no-throw-literal
            if (!res.ok) throw { status: res.status, errors: res.text() };
            else return res.text();
        });
    }
}

export default CredentialController;
