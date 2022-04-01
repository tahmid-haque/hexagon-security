import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';

const countCredentialsQuery = gql`
    query {
        countWebsiteCredentials {
            name
        }
    }
`;

const findCredentialsContainsQuery = gql`
    query ($name: String!, $contains: Boolean!, $getShares: Boolean!) {
        findCredentialsContains(
            getShares: $getShares
            contains: $contains
            name: $name
        ) {
            _id
            name
            key
            recordID
            credentials {
                _id
                username
                password
            }
        }
    }
`;

const findCredentialsContainsWithSharesQuery = gql`
    query ($name: String!, $contains: Boolean!, $getShares: Boolean!) {
        findCredentialsContains(
            getShares: $getShares
            contains: $contains
            name: $name
        ) {
            _id
            name
            key
            recordID
            credentials {
                _id
                username
                password
                UIDs {
                    UID
                }
            }
            share{
                reciever
                shareId
            }
        }
    }
`;

const findCredentialsQuery = gql`
    query (
        $offset: Int!
        $limit: Int!
        $sortType: String!
        $getShares: Boolean!
    ) {
        findCredentials(
            getShares: $getShares
            offset: $offset
            limit: $limit
            sortType: $sortType
        ) {
            _id
            name
            key
            recordID
            credentials {
                _id
                username
                password
            }
        }
    }
`;

const findCredentialsWithSharesQuery = gql`
    query (
        $offset: Int!
        $limit: Int!
        $sortType: String!
        $getShares: Boolean!
    ) {
        findCredentials(
            getShares: $getShares
            offset: $offset
            limit: $limit
            sortType: $sortType
        ) {
            _id
            name
            key
            recordID
            credentials {
                _id
                username
                password
                UIDs {
                    UID
                }
            }
            share{
                reciever
                shareId
            }
        }
    }
`;

const addWebsiteCredentialsMutation = gql`
    mutation (
        $name: String!
        $username: String!
        $password: String!
        $key: String!
    ) {
        addWebsiteCredentials(
            name: $name
            username: $username
            password: $password
            key: $key
        ) {
            _id
        }
    }
`;

const updateCredentialsMutation = gql`
    mutation (
        $username: String!
        $password: String!
        $secureRecordID: String!
    ) {
        updateCredentials(
            username: $username
            password: $password
            secureRecordID: $secureRecordID
        ) {
            _id
        }
    }
`;

class CredentialController {
    private client!: ApolloClient<NormalizedCacheObject>;
    private token!: string;
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.client = client;
        this.token = token;
    }

    private buildQuery(query: any, variables: any) {
        return {
            query,
            context: {
                headers: {
                    jwt: this.token, // this header will reach the server
                },
            },
            variables,
        };
    }

    public findCredentials(
        offset: number,
        limit: number,
        sortType: string,
        getShares: boolean
    ) {
        if (getShares) {
            return this.client.query(
                this.buildQuery(findCredentialsWithSharesQuery, {
                    offset: offset,
                    limit: limit,
                    sortType: sortType,
                    getShares: getShares,
                })
            );
        } else {
            return this.client.query(
                this.buildQuery(findCredentialsQuery, {
                    offset: offset,
                    limit: limit,
                    sortType: sortType,
                    getShares: getShares,
                })
            );
        }
    }

    public findCredentialsContains(
        name: string,
        contains: boolean,
        getShares: boolean
    ) {
        if (getShares) {
            return this.client.query(
                this.buildQuery(findCredentialsContainsWithSharesQuery, {
                    name: name,
                    contains: contains,
                    getShares: getShares,
                })
            );
        } else {
            return this.client.query(
                this.buildQuery(findCredentialsContainsQuery, {
                    name: name,
                    contains: contains,
                    getShares: getShares,
                })
            );
        }
    }

    public countWebsiteCredentials() {
        return this.client.query(this.buildQuery(countCredentialsQuery, {}));
    }

    public addWebsiteCredentials(
        name: string,
        username: string,
        password: string,
        key: string
    ) {
        return this.client.query(
            this.buildQuery(addWebsiteCredentialsMutation, {
                name: name,
                username: username,
                password: password,
                key: key,
            })
        );
    }

    public updateCredentials(
        username: string,
        password: string,
        secureRecordID: string
    ) {
        return this.client.query(
            this.buildQuery(updateCredentialsMutation, {
                username: username,
                password: password,
                secureRecordID: secureRecordID,
            })
        );
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
