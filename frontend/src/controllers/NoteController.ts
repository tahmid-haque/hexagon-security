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

    /**
     * Sorts the records by sortType, starts from the given offSet and returns 
     * records upto the given limit
     * @param {string} sortType ascending or descending
     * @param {number} offset offset
     * @param {number} limit limit
     * @returns {any} list of SecureRecord data for notes
     */
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

    /**
     * counts the number of notes for the current user and returns the count
     * @returns {any} number of note records
     */
    public countNotes() {
        return this.executeQuery(countNotesQuery, {}, false).then(
            (data) => data.countNotes as number
        );
    }

    /**
     * Attempts to create a secure record with the given arguments, returns
     * the newly created record on success
     * @param {string} title title of the note
     * @param {string} note content of the note
     * @param {string} key key used for encryption
     * @param {string} masterUsername username for the hexagon user
     * @returns {any} newly created record data
     */
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

    /**
     * Attempts to update an existing note record with a new title and content,
     * throws an error on failure
     * @param {string} title updates with the new title
     * @param {string} note updates with the new note content
     * @param {string} secureRecordId points to the note record to be updated
     * @returns {any} newly created note data
     */
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
