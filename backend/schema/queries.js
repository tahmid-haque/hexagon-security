const graphql = require('graphql');
const SecureRecord = require('../models/SecureRecord');
const Share = require('../models/Share');
const CryptoService = require('hexagon-shared/services/CryptoService');
const crypto = require('crypto').webcrypto;
const parser = require('hexagon-shared/utils/parser');
const cryptoService = new CryptoService(crypto);
const sanitize = require('mongo-sanitize');
const { trusted } = require('mongoose');
const { SecureRecordType, ShareType } = require('./types');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLError,
} = graphql;

/**
 * Throws an error based on the error and status code
 * @param {any} err the error
 * @param {any} status the status
 * @returns {any} GraphQLError
 */
const throwDBError = (err, status) => {
    throw new GraphQLError('Custom error', {
        extensions: { ...err, status: status ?? 500 },
    });
};

/**
 * Series of queries for searching and getting data
 */
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        /**
         * Searches for a website credential given URL/name, if exactMatch
         * is false then returns all secure records containing the given name
         * @param {GraphQLString} name domain url or name
         * @param {GraphQLBoolean} exactMatch boolean value
         * @returns {any} SecureRecord data for website credentials
         */
        searchCredentials: {
            type: new GraphQLList(SecureRecordType),
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                exactMatch: { type: GraphQLBoolean },
            },
            resolve(parent, args, context) {
                const name = !args.exactMatch
                    ? trusted({ $regex: sanitize(args.name), $options: 'i' })
                    : parser.extractDomain(args.name);
                return SecureRecord.find({
                    name,
                    type: 'account',
                    uid: context.token.uid,
                });
            },
        },
        /**
         * Searches for a MFA given URL/name, if exactMatch
         * is false then returns all secure records containing the given name
         * @param {GraphQLString} name domain url or name
         * @param {GraphQLBoolean} exactMatch boolean value
         * @returns {any} SecureRecord data for MFA
         */
        searchMFAs: {
            type: new GraphQLList(SecureRecordType),
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                exactMatch: { type: GraphQLBoolean },
            },
            resolve(parent, args, context) {
                const name = !args.exactMatch
                    ? trusted({ $regex: sanitize(args.name), $options: 'i' })
                    : parser.extractDomain(args.name);
                return SecureRecord.find({
                    name,
                    type: 'seed',
                    uid: context.token.uid,
                });
            },
        },
        /**
         * Sorts the records by sortType, starts from the given offSet and returns
         * records upto the given limit
         * @param {GraphQLString} sortType ascending or descending
         * @param {GraphQLInt} offset offset
         * @param {GraphQLInt} limit limit
         * @returns {any} list of SecureRecord data for credentials
         */
        getCredentials: {
            type: new GraphQLList(SecureRecordType),
            args: {
                sortType: { type: GraphQLString },
                offset: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve(parent, args, context) {
                if (!parser.isSortValid(args.sortType))
                    throwDBError({ sortType: 'Invalid sort type' }, 400);

                return SecureRecord.find({
                    type: 'account',
                    uid: context.token.uid,
                })
                    .sort({ name: args.sortType })
                    .skip(args.offset)
                    .limit(args.limit);
            },
        },
        /**
         * Sorts the records by sortType, starts from the given offSet and returns
         * records upto the given limit
         * @param {GraphQLString} sortType ascending or descending
         * @param {GraphQLInt} offset offset
         * @param {GraphQLInt} limit limit
         * @returns {any} list of SecureRecord data for notes
         */
        getNotes: {
            type: new GraphQLList(SecureRecordType),
            args: {
                sortType: { type: GraphQLString },
                offset: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve(parent, args, context) {
                if (!parser.isSortValid(args.sortType))
                    throwDBError({ sortType: 'Invalid sort type' }, 400);

                return SecureRecord.find({
                    type: 'note',
                    uid: context.token.uid,
                })
                    .sort({ name: args.sortType })
                    .skip(args.offset)
                    .limit(args.limit);
            },
        },
        /**
         * Sorts the records by sortType, starts from the given offSet and returns
         * records upto the given limit
         * @param {GraphQLString} sortType ascending or descending
         * @param {GraphQLInt} offset offset
         * @param {GraphQLInt} limit limit
         * @returns {any} list of SecureRecord data for MFAs
         */
        getMFAs: {
            type: new GraphQLList(SecureRecordType),
            args: {
                sortType: { type: GraphQLString },
                offset: { type: GraphQLInt },
                limit: { type: GraphQLInt },
            },
            resolve(parent, args, context) {
                if (!parser.isSortValid(args.sortType))
                    throwDBError({ sortType: 'Invalid sort type' }, 400);

                return SecureRecord.find({
                    type: 'seed',
                    uid: context.token.uid,
                })
                    .sort({ name: args.sortType })
                    .skip(args.offset)
                    .limit(args.limit);
            },
        },
        /**
         * Searches for the share given by shareId, decrypts and verifies using shareKey
         * and returns the data
         * @param {GraphQLString} shareKey key used for decryption
         * @param {GraphQLString} shareId id used for searching
         * @returns {any} share record
         */
        getShare: {
            type: ShareType,
            args: {
                shareKey: { type: new GraphQLNonNull(GraphQLString) },
                shareId: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args, context) => {
                const share = await Share.findOne({ _id: args.shareId });

                if (!share) throwDBError({ shareId: 'Could not find' }, 404);
                const [key] = await cryptoService.decryptSecrets(
                    [share.key],
                    args.shareKey
                );
                const [receiver] = await cryptoService.decryptData(
                    [share.receiver],
                    key
                );
                if (receiver != context.token.username)
                    throwDBError({ receiver: 'Unauthorized' }, 403);

                return { ...share.toObject(), key };
            },
        },
        /**
         * counts the number of MFAs for the current user and returns the count
         * @returns {any} number of MFA records
         */
        countMFAs: {
            type: GraphQLInt,
            args: {},
            resolve(parent, args, context) {
                return SecureRecord.find({
                    type: 'seed',
                    uid: context.token.uid,
                }).count();
            },
        },
        /**
         * counts the number of notes for the current user and returns the count
         * @returns {any} number of note records
         */
        countNotes: {
            type: GraphQLInt,
            args: {},
            resolve(parent, args, context) {
                return SecureRecord.find({
                    type: 'note',
                    uid: context.token.uid,
                }).count();
            },
        },
        /**
         * counts the number of credentials for the current user and returns the count
         * @returns {any} number of credentials records
         */
        countWebsiteCredentials: {
            type: GraphQLInt,
            args: {},
            resolve(parent, args, context) {
                return SecureRecord.find({
                    type: 'account',
                    uid: context.token.uid,
                }).count();
            },
        },
    },
});

module.exports = {
    RootQuery,
};
