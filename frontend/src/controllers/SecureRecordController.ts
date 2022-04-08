import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

const deleteSecureRecordMutation = gql`
    mutation ($secureRecordId: String!) {
        deleteSecureRecord(secureRecordId: $secureRecordId) {
            _id
        }
    }
`;

class SecureRecordController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    /**
     * Attempts to delete an existing secure record,
     * throws an error on failure
     * @param {string} secureRecordId record to be deleted
     * @returns {any} deleted secure record
     */
    public deleteSecureRecord(secureRecordId: string) {
        return this.executeQuery(
            deleteSecureRecordMutation,
            { secureRecordId },
            true
        ).then((data) => data.deleteSecureRecord._id as string);
    }
}

export default SecureRecordController;
