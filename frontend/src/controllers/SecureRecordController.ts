import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';

const deleteSecureRecordMutation = gql`
    mutation ($secureRecordId: String!) {
        deleteSecureRecord(secureRecordId: $secureRecordId) {
            _id
        }
    }
`;

class SecureRecordController {
    private client!: ApolloClient<NormalizedCacheObject>;
    private token!: string;
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.client = client;
        this.token = token;
    }

    public deleteSecureRecord(secureRecordId: string) {
        return this.client
            .mutate({
                mutation: deleteSecureRecordMutation,
                context: {
                    headers: {
                        jwt: this.token,
                    },
                },
                variables: { secureRecordId },
            })
            .then((res) => res.data.deleteSecureRecord as string)
            .catch((err) => {
                const error = JSON.parse(err.message);
                error.status = Number(error.status);
                throw error;
            });
    }
}

export default SecureRecordController;
