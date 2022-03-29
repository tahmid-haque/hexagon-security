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
            name
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

    // private buildQuery(query: DocumentNode){
    //     return {query,
    //             context: {
    //                 headers: {
    //                     "jwt": this.token  // this header will reach the server
    //                 }
    //             }
    //           }
    // }

    public findCredentials(
        offset: number,
        limit: number,
        sortType: string,
        getShares: boolean
    ) {
        this.client
            .query({
                query: findCredentialsQuery,
                context: {
                    headers: {
                        jwt: this.token, // this header will reach the server
                    },
                },
                variables: {
                    offset: offset,
                    limit: limit,
                    sortType: sortType,
                    getShares: getShares,
                },
            })
            .then((result) => console.log(result));
    }

    public findCredentialsContains(
        name: string,
        contains: boolean,
        getShares: boolean
    ) {
        this.client
            .query({
                query: findCredentialsContainsQuery,
                context: {
                    headers: {
                        jwt: this.token, // this header will reach the server
                    },
                },
                variables: {
                    name: name,
                    contains: contains,
                    getShares: getShares,
                },
            })
            .then((result) => console.log(result));
    }

    public countWebsiteCredentials() {
        this.client
            .query({
                query: countCredentialsQuery,
                context: {
                    headers: {
                        jwt: this.token, // this header will reach the server
                    },
                },
            })
            .then((result) => console.log(result));
    }

    public addWebsiteCredentials(
        name: string,
        username: string,
        password: string,
        key: string
    ) {
        this.client
            .query({
                query: addWebsiteCredentialsMutation,
                context: {
                    headers: {
                        jwt: this.token, // this header will reach the server
                    },
                },
                variables: {
                    name: name,
                    username: username,
                    password: password,
                    key: key,
                },
            })
            .then((result) => console.log(result));
    }

    public updateCredentials(
        username: string,
        password: string,
        secureRecordID: string
    ) {
        this.client
            .query({
                query: updateCredentialsMutation,
                context: {
                    headers: {
                        jwt: this.token, // this header will reach the server
                    },
                },
                variables: {
                    username: username,
                    password: password,
                    secureRecordID: secureRecordID,
                },
            })
            .then((result) => console.log(result));
    }

    async checkBreach(hash: string): Promise<string> {
        return fetch(
            `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`,
            {
                method: 'GET',
            }
        ).then((res) => {
            if (!res.ok)
                throw new Error(
                    JSON.stringify({ status: res.status, errors: res.text() })
                );
            else return res.text();
        });
    }
}

export default CredentialController;
