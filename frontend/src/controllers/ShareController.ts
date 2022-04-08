import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

const getShareQuery = gql`
    query ($shareKey: String!, $shareId: String!) {
        getShare(shareKey: $shareKey, shareId: $shareId) {
            type
            name
            key
        }
    }
`;

const addShareMutation = gql`
    mutation ($receiver: String!, $secureRecordId: String!, $key: String!) {
        addShare(
            receiver: $receiver
            secureRecordId: $secureRecordId
            key: $key
        ) {
            _id
        }
    }
`;

const deleteShareMutation = gql`
    mutation ($secureRecordId: String!, $shareId: String!) {
        deleteShare(shareId: $shareId, secureRecordId: $secureRecordId) {
            _id
        }
    }
`;

const revokeShareMutation = gql`
    mutation ($secureRecordId: String!, $owner: String!) {
        revokeShare(owner: $owner, secureRecordId: $secureRecordId)
    }
`;

const finalizeShareMutation = gql`
    mutation (
        $shareKey: String!
        $shareId: String!
        $isAccepted: Boolean!
        $masterUsername: String!
        $recordKey: String!
    ) {
        finalizeShare(
            shareKey: $shareKey
            shareId: $shareId
            isAccepted: $isAccepted
            masterUsername: $masterUsername
            recordKey: $recordKey
        )
    }
`;

export type ShareDetailsDto = {
    name: string;
    type: string;
    key: string;
};

/**
 * Controller to communicate with the backend in all share related functions
 */
class ShareController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    /**
     * Creates a ShareController to communicate with the backend
     * @param client the GraphQL client used to communicate with the backend
     * @param token the user's JWT
     */
    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    /**
     * Searches for the share given by shareId
     * @param shareKey key used for decryption
     * @param shareId id used for searching
     * @returns the share details
     */
    getShare(shareId: string, shareKey: string) {
        return this.executeQuery(
            getShareQuery,
            { shareId, shareKey },
            false
        ).then((data) => data.getShare as ShareDetailsDto);
    }

    /**
     * Attempts to create a share with the given arguments
     * @param secureRecordId points to secure record
     * @param receiver the user who you wish to add as an owner
     * @param key key used for encryption
     * @returns the id of the created share
     */
    createShare(receiver: string, secureRecordId: string, key: string) {
        return this.executeQuery(
            addShareMutation,
            { receiver, secureRecordId, key },
            true
        ).then((data) => data.addShare._id as string);
    }

    /**
     * Attempts to delete a pending share,
     * throws an error on failure
     * @param secureRecordId id of which shareId belongs to
     * @param shareId share to be deleted
     * @returns id of the deleted pending share
     */
    deleteShare(shareId: string, secureRecordId: string) {
        return this.executeQuery(
            deleteShareMutation,
            { shareId, secureRecordId },
            true
        ).then((data) => data.deleteShare._id as string);
    }

    /**
     * Attempts to revoke a share from the given secureRecordId,
     * throws an error on failure
     * @param owner username of the owner to be revoked
     * @param secureRecordId id of the record to perform the revoke action
     * @returns whether the operation was successful
     */
    revokeShare(owner: string, secureRecordId: string) {
        return this.executeQuery(
            revokeShareMutation,
            { owner, secureRecordId },
            true
        ).then((data) => data.revokeShare as boolean);
    }

    /**
     * Finalizes a share based on given arguments,
     * If isAccepted is true, user becomes a new owner of the recordID,
     * throws an error on any failures
     * @param shareKey key used for decryption
     * @param shareId Id pointing to share record request
     * @param isAccepted determines if user accepts or declines share request
     * @param masterUsername username of the current user
     * @param recordKey key used to create to secure record
     * @returns the secure record id of the accepted share
     */
    finalizeShare(
        shareKey: string,
        shareId: string,
        isAccepted: boolean,
        masterUsername: string,
        recordKey: string
    ) {
        return this.executeQuery(
            finalizeShareMutation,
            { shareKey, shareId, isAccepted, masterUsername, recordKey },
            true
        ).then((data) => data.finalizeShare as string);
    }
}

export default ShareController;
