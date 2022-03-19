const graphql = require("graphql");
const _ = require('lodash');
const HexagonUser = require('../models/HexagonUser');
const SecureRecord = require('../models/SecureRecord');
const WebsiteCredentials = require('../models/WebsiteCredentials');

const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull} = graphql;

const HexagonUserType = new GraphQLObjectType({
    name: 'HexagonUser',
    fields: () => ({
        id: {type: GraphQLString},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        masterKey: {type: GraphQLString},
        UID: {type: GraphQLString},
        credentials: {
            type: new GraphQLList(WebsiteCredentialsType),
            resolve(parent, args){
                //return _.filter(WebsiteCredentials, {UIDs:parent.UID}) // need to find out how to retrieve from a  list of UIDs
                return SecureRecord.find({type: "account", UID: parent.UID});
            }
        },
        MFAs: {
            type: new GraphQLList(MFAType), 
            resolve(parent, args){
                //return _.find(WebsiteCredentials,{UIDs:parent.recordID})
            }
        },
        notes: {
            type: new GraphQLList(NoteType), 
            resolve(parent, args){
                //return _.find(Notes,{UIDs:parent.recordID})
            }
        },
    })
})

//depending on type, we wil only query for that item (credentials, MFA, notes), need to do this in front end?
const SecureRecordType = new GraphQLObjectType({
    name: 'SecureRecord',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        key: {type: GraphQLString},
        recordID: {type: GraphQLString},
        UID: {type: GraphQLString},
        type: {type: GraphQLString},
        credentials: {
            type: WebsiteCredentialsType,
            resolve(parent, args){
                //return _.find(WebsiteCredentials,{id:parent.recordID})
                return WebsiteCredentials.findById(parent.recordID);
            }
        },
        MFA: {
            type: MFAType, 
            resolve(parent, args){
                //return _.find(WebsiteCredentials,{id:parent.recordID})
            }
        },
        notes: {
            type: NoteType, 
            resolve(parent, args){
                //return _.find(Notes,{id:parent.recordID})
            }
        },

    })
})

const WebsiteCredentialsType = new GraphQLObjectType({
    name: 'WebsiteCredentials',
    fields: () => ({
        id: {type: GraphQLString},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        UIDs: {type: GraphQLString}
    })
})

const MFAType = new GraphQLObjectType({
    name: 'MFA',
    fields: () => ({
        id: {type: GraphQLString},
        user: {type: GraphQLString},
        seed: {type: GraphQLString},
        UIDs: {type: GraphQLString}
    })
})

const NoteType = new GraphQLObjectType({
    name: 'Notes',
    fields: () => ({
        id: {type: GraphQLString},
        note: {type: GraphQLString},
        UIDs: {type: GraphQLString}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        HexagonUser: {
            type: HexagonUserType,
            args: {username: {type: GraphQLString}},
            resolve(parent, args){
                return HexagonUser.findOne({username: args.username})
            }
        },
        SecureRecordByID: {
            type: SecureRecordType,
            args: {id: {type: GraphQLString}},
            resolve(parent, args){
                return SecureRecord.findOne({id: args.id});
            }
        },
        SecureRecordByUIDType: {
            type: new GraphQLList(SecureRecordType),
            args: {type: {type: GraphQLString}, UID :{type: GraphQLString}},
            resolve(parent, args){
                return SecureRecord.find({type: args.type, UID: args.UID});
            }
        },
        // WebsiteCredential: {
        //     type: WebsiteCredentialsType,
        //     args: {id: {type: GraphQLString}},
        //     resolve(parent, args){
        //         //code to get from db
        //         return _.find(WebsiteCredentials,{id: args.id});
        //     }
        // }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields:{
        addHexagonUser:{
            type: HexagonUserType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                UID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parents,args){
                let hexagonUser = new HexagonUser({
                    username: args.username,
                    password: args.password,
                    UID: args.UID
                });
                return hexagonUser.save();
            }
        },
        addSecureRecord:{
            type: SecureRecordType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                key: {type: new GraphQLNonNull(GraphQLString)},
                recordID: {type: new GraphQLNonNull(GraphQLString)},
                UID: {type: new GraphQLNonNull(GraphQLString)},
                type: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parents,args){
                let secureRecord = new SecureRecord({
                    name: args.name,
                    key: args.key,
                    recordID: args.recordID,
                    UID: args.UID,
                    type: args.type
                });
                return secureRecord.save();
            }
        },
        addWebsiteCredentials:{
            type: WebsiteCredentialsType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                UIDs: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parents,args){
                let websiteCredentials = new WebsiteCredentials({
                    username: args.username,
                    password: args.password,
                    UIDs: args.UIDs
                });
                return websiteCredentials.save();
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});