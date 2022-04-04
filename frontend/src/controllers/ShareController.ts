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
class ShareController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    public getShare(shareId: string, shareKey: string) {
        return this.executeQuery(
            getShareQuery,
            { shareId, shareKey },
            false
        ).then((data) => data.getShare as ShareDetailsDto);
    }

    public createShare(receiver: string, secureRecordId: string, key: string) {
        return this.executeQuery(
            addShareMutation,
            { receiver, secureRecordId, key },
            true
        ).then((data) => data.addShare._id as string);
    }

    public deleteShare(shareId: string, secureRecordId: string) {
        return this.executeQuery(
            deleteShareMutation,
            { shareId, secureRecordId },
            true
        ).then((data) => data.deleteShare._id as string);
    }

    public revokeShare(owner: string, secureRecordId: string) {
        return this.executeQuery(
            revokeShareMutation,
            { owner, secureRecordId },
            true
        ).then((data) => data.revokeShare as boolean);
    }

    public finalizeShare(
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
