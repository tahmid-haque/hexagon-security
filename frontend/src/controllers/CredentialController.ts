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

/**
 * Controller to communicate with the backend in all website credential related functions
 */
class CredentialController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    /**
     * Creates a CredentialController to communicate with the backend
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
     * @returns a promise resolving to a list of credential data
     */
    getCredentials(offset: number, limit: number, sortType: string) {
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
     * Searches for all website credentials given a URL/name stripped of passwords and ownership
     * @param name domain url
     * @param exactMatch whether or not to match the domain exactly
     * @returns a promise resolving to a list of credential data
     */
    searchCredentials(name: string, exactMatch: boolean) {
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
     * @param name domain url or name
     * @param exactMatch boolean value
     * @returns a promise resolving to a list of credential data
     */
    searchWebsiteCredentials(name: string, exactMatch: boolean) {
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
     * Counts the number of credentials for the current user
     * @returns number of credentials
     */
    countCredentials() {
        return this.executeQuery(countCredentialsQuery, {}, false).then(
            (data) => data.countWebsiteCredentials as number
        );
    }

    /**
     * Attempts to create a credential with the given arguments
     * @param name website url
     * @param username username for the website
     * @param password password for the website
     * @param key key used for encryption
     * @param masterUsername username for the hexagon user
     * @returns id of created credential
     */
    addCredential(
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
     * @param username updates with the new username
     * @param password updates with the new note password
     * @param secureRecordId points to the credential to be updated
     * @returns id of updated credential
     */
    updateCredentials(
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
     * Checks for any breaches given the hashPrefix
     * @param hashPrefix the prefix to search for
     * @returns a list of hashes and their corresponding breach count
     */
    checkBreach(hashPrefix: string): Promise<string> {
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
