const graphql = require('graphql');
const WebsiteCredentials = require('../models/WebsiteCredentials');
const Share = require('../models/Share');
const Seed = require('../models/Seed');
const Note = require('../models/Note');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} = graphql;

/**
 * Extracts and returns data related to the record model
 * @param {any} recordModel record model
 * @returns {any} data related to the recordModel
 */
const extractRecord = (recordModel) => {
    const record = recordModel.toObject();
    return { ...record, owners: record.owners.map((owner) => owner.username) };
};

const SecureRecordType = new GraphQLObjectType({
    name: 'SecureRecord',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        key: { type: GraphQLString },
        recordId: { type: GraphQLString },
        type: { type: GraphQLString },
        credential: {
            type: WebsiteCredentialsType,
            resolve: async (parent, args) => {
                const record = await WebsiteCredentials.findById(
                    parent.recordId
                );
                if (!record)
                    return {
                        _id: '',
                        username: '',
                        password: '',
                        owners: [],
                    };
                return extractRecord(record);
            },
        },
        mfa: {
            type: MFAType,
            resolve: async (parent, args) => {
                const record = await Seed.findById(parent.recordId);
                if (!record)
                    return {
                        _id: '',
                        username: '',
                        seed: '',
                        owners: [],
                    };
                return extractRecord(record);
            },
        },
        note: {
            type: NoteType,
            resolve: async (parent, args) => {
                const record = await Note.findById(parent.recordId);
                if (!record)
                    return {
                        _id: '',
                        lastModified: new Date(),
                        title: '',
                        body: '',
                        owners: [],
                    };
                return extractRecord(record);
            },
        },
        pendingShares: {
            type: new GraphQLList(ShareType),
            resolve(parent, args) {
                return Share.find({ recordId: parent.recordId });
            },
        },
    }),
});

const WebsiteCredentialsType = new GraphQLObjectType({
    name: 'WebsiteCredentials',
    fields: () => ({
        _id: { type: GraphQLString },
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        owners: { type: new GraphQLList(GraphQLString) },
    }),
});

const MFAType = new GraphQLObjectType({
    name: 'MFA',
    fields: () => ({
        _id: { type: GraphQLString },
        username: { type: GraphQLString },
        seed: { type: GraphQLString },
        owners: { type: new GraphQLList(GraphQLString) },
    }),
});

const NoteType = new GraphQLObjectType({
    name: 'Notes',
    fields: () => ({
        _id: { type: GraphQLString },
        lastModified: { type: GraphQLString },
        title: { type: GraphQLString },
        note: { type: GraphQLString },
        owners: { type: new GraphQLList(GraphQLString) },
    }),
});

const ShareType = new GraphQLObjectType({
    name: 'Shares',
    fields: () => ({
        _id: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        recordId: { type: GraphQLString },
        receiver: { type: GraphQLString },
        key: { type: GraphQLString },
    }),
});

module.exports = Object.freeze({
    ShareType,
    SecureRecordType
})