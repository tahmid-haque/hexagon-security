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

/**
 * Controller to communicate with the backend in all note related functions
 */
class NoteController {
    private executeQuery: (
        query: any,
        variables: any,
        isMutation: boolean
    ) => Promise<any>;

    /**
     * Creates a NoteController to communicate with the backend
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
     * @returns a promise resolving to a list of note data
     */
    getNotes(offset: number, limit: number, sortType: string) {
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

    /**
     * Counts the number of notes for the current user
     * @returns the number of notes
     */
    countNotes() {
        return this.executeQuery(countNotesQuery, {}, false).then(
            (data) => data.countNotes as number
        );
    }

    /**
     * Attempts to create a note with the given arguments
     * @param {string} title title of the note
     * @param {string} note content of the note
     * @param {string} key key used for encryption
     * @param {string} masterUsername username for the hexagon user
     * @returns id of created note
     */
    createNote(
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

    /**
     * Attempts to update an existing note record with a new title and content,
     * throws an error on failure
     * @param title updates with the new title
     * @param note updates with the new note content
     * @param secureRecordId points to the note record to be updated
     * @returns id of ipdated note
     */
    updateNote(title: string, note: string, secureRecordId: string) {
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
