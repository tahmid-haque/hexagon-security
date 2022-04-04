import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { executeQuery } from '../utils/controller';

const countNotesQuery = gql`
    query {
        countNotes
    }
`;

const getNotesQuery = gql`
    query ($offset: Int!, $limit: Int!, $sortType: String!) {
        getNotes(offset: $offset, limit: $limit, sortType: $sortType) {
            _id
            name
            key
            note {
                lastModified
                title
                note
                owners
            }
            pendingShares {
                receiver
                _id
            }
        }
    }
`;

const addNoteMutation = gql`
    mutation (
        $title: String!
        $note: String!
        $key: String!
        $masterUsername: String!
    ) {
        addNote(
            title: $title
            note: $note
            key: $key
            masterUsername: $masterUsername
        ) {
            _id
        }
    }
`;

const updateNoteMutation = gql`
    mutation ($title: String!, $note: String!, $secureRecordId: String!) {
        updateNote(
            title: $title
            note: $note
            secureRecordId: $secureRecordId
        ) {
            _id
        }
    }
`;

export type NoteDto = {
    _id: string;
    name: string;
    key: string;
    note: {
        lastModified: string;
        title: string;
        note: string;
        owners: string[];
    };
    pendingShares: { receiver: string; _id: string }[];
};

class NoteController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    constructor(client: ApolloClient<NormalizedCacheObject>, token: string) {
        this.executeQuery = executeQuery.bind(this, client, token);
    }

    public getNotes(offset: number, limit: number, sortType: string) {
        return this.executeQuery(
            getNotesQuery,
            {
                offset: offset,
                limit: limit,
                sortType: sortType,
            },
            false
        ).then((data) => data.getNotes as NoteDto[]);
    }

    public countNotes() {
        return this.executeQuery(countNotesQuery, {}, false).then(
            (data) => data.countNotes as number
        );
    }

    public createNote(
        title: string,
        note: string,
        key: string,
        masterUsername: string
    ) {
        return this.executeQuery(
            addNoteMutation,
            {
                title,
                note,
                key,
                masterUsername,
            },
            true
        ).then((data) => data.addNote._id as string);
    }

    public updateNote(title: string, note: string, secureRecordId: string) {
        return this.executeQuery(
            updateNoteMutation,
            {
                title,
                note,
                secureRecordId,
            },
            true
        ).then((data) => data.updateNote._id as string);
    }
}

export default NoteController;
