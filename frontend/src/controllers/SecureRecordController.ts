import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

const deleteSecureRecordMutation = gql`
    mutation ($secureRecordId: String!) {
        deleteSecureRecord(secureRecordId: $secureRecordId) {
            _id
        }
    }
`;

/**
 * Controller to communicate with the backend in certain record related functions
 */
class SecureRecordController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    /**
     * Creates a SecureRecordController to communicate with the backend
     * @param client the GraphQL client used to communicate with the backend
     * @param token the user's JWT
     */
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    /**
     * Attempts to delete an existing secure record,
     * throws an error on failure
     * @param secureRecordId record to be deleted
     * @returns the id of the deleted record
     */
    deleteSecureRecord(secureRecordId: string) {
        return this.executeQuery(
            deleteSecureRecordMutation,
            { secureRecordId },
            true
        ).then((data) => data.deleteSecureRecord._id as string);
    }
}

export default SecureRecordController;
