const graphql = require("graphql");
const _ = require('lodash');
const HexagonUser = require('../models/HexagonUser');
const SecureRecord = require('../models/SecureRecord');
const WebsiteCredentials = require('../models/WebsiteCredentials');
const Share = require('../models/Share');
const Seed =  require('../models/Seed');
const Note = require('../models/Note');
const uuid = require('uuid');

const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLInputObjectType, GraphQLBoolean, GraphQLInt} = graphql;

const HexagonUserType = new GraphQLObjectType({
    name: 'HexagonUser',
    fields: () => ({
        _id: {type: GraphQLString},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        masterKey: {type: GraphQLString},
        UID: {type: GraphQLString},
        // credentials: {
        //     type: new GraphQLList(WebsiteCredentialsType),
        //     resolve(parent, args){
        //         return SecureRecord.find({type: "account", UID: parent.UID});
        //     }
        // },
        // MFAs: {
        //     type: new GraphQLList(MFAType), 
        //     resolve(parent, args){
        //         //return _.find(WebsiteCredentials,{UIDs:parent.recordID})
        //     }
        // },
        // notes: {
        //     type: new GraphQLList(NoteType), 
        //     resolve(parent, args){
        //         //return _.find(Notes,{UIDs:parent.recordID})
        //     }
        // },
    })
})

//depending on type, we wil only query for that item (credentials, MFA, notes), need to do this in front end?
const SecureRecordType = new GraphQLObjectType({
    name: 'SecureRecord',
    fields: () => ({
        _id: {type: GraphQLString},
        name: {type: GraphQLString},
        key: {type: GraphQLString},
        recordID: {type: GraphQLString},
        UID: {type: GraphQLString},
        type: {type: GraphQLString},
        credentials: {
            type: WebsiteCredentialsType,
            resolve(parent, args){
                return WebsiteCredentials.findById(parent.recordID);
            }
        },
        MFA: {
            type: MFAType, 
            resolve(parent, args){
                //return _.find(WebsiteCredentials,{id:parent.recordID})
                return Seed.findById(parent.recordID);
            }
        },
        notes: {
            type: NoteType, 
            resolve(parent, args){
                return Note.findById(parent.recordID);
            }
        },

    })
})

const UIDsType = new GraphQLObjectType({
    name: 'UIDS',
    fields: () => ({
        UID: {type: GraphQLString},
        secureRecordID: {type: GraphQLString},
        secureRecord: {
            type: SecureRecordType,
            resolve(parent, args){
                return SecureRecord.findOne({_id: parent.secureRecordID});
            }
        }
    })
})

const WebsiteCredentialsType = new GraphQLObjectType({
    name: 'WebsiteCredentials',
    fields: () => ({
        _id: {type: GraphQLString},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        UIDs: {type: new GraphQLList(UIDsType)}
    })
})

const MFAType = new GraphQLObjectType({
    name: 'MFA',
    fields: () => ({
        _id: {type: GraphQLString},
        username: {type: GraphQLString},
        seed: {type: GraphQLString},
        UIDs: {type: new GraphQLList(UIDsType)}
    })
})

const NoteType = new GraphQLObjectType({
    name: 'Notes',
    fields: () => ({
        _id: {type: GraphQLString},
        lastModified: {type: GraphQLString},
        title: {type: GraphQLString},
        note: {type: GraphQLString},
        UIDs: {type: new GraphQLList(UIDsType)}
    })
})

const ShareType = new GraphQLObjectType({
    name: 'Shares',
    fields: () => ({
        _id: {type: GraphQLString},
        secureRecordID: {type: GraphQLString},
        reciever: {type: GraphQLString},
        key: {type: GraphQLString},
        secureRecord: {
            type: SecureRecordType,
            resolve(parent, args){
                //return _.find(WebsiteCredentials,{id:parent.recordID})
                return SecureRecord.findOne({_id: parent.secureRecordID});
            }
        }
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
        findCredentialsContains: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}, name: {type: new GraphQLNonNull(GraphQLString)}, contains: {type: GraphQLBoolean}, getShares: {type: GraphQLBoolean}},
            resolve(parent, args, context){
                if(args.contains){
                    return SecureRecord.find({ "name": { "$regex": args.name, "$options": "i" }, type: "account", UID: context.token.UID});
                }
                return SecureRecord.find({name: args.name, type: "account", UID: context.token.UID});
            }
        },
        findMFAContains: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}, name: {type: new GraphQLNonNull(GraphQLString)}, contains: {type: GraphQLBoolean}, getShares: {type: GraphQLBoolean}},
            resolve(parent, args, context){
                if(args.contains){
                    return SecureRecord.find({ "name": { "$regex": args.name, "$options": "i" }, type: "seed", UID: context.token.UID});
                }
                return SecureRecord.find({name: args.name, type: "seed", UID: context.token.UID});
            }
        },
        findCredentials: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}, sortType: {type: GraphQLString}, offset: {type: GraphQLInt}, limit: {type: GraphQLInt}, getShares: {type: GraphQLBoolean}},
            resolve(parent, args, context){
                return SecureRecord.find({type: "account", UID: context.token.UID}).sort({name: args.sortType }).skip(args.offset).limit(args.limit);
            }
        },
        findNotes: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}, sortType: {type: GraphQLString}, offset: {type: GraphQLInt}, limit: {type: GraphQLInt}, getShares: {type: GraphQLBoolean}},
            resolve(parent, args, context){
                return SecureRecord.find({type: "note", UID: context.token.UID}).sort({name: args.sortType }).skip(args.offset).limit(args.limit);
            }
        },
        findMFA: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}, sortType: {type: GraphQLString}, offset: {type: GraphQLInt}, limit: {type: GraphQLInt}, getShares: {type: GraphQLBoolean}},
            resolve(parent, args, context){
                return SecureRecord.find({type: "seed", UID: context.token.UID}).sort({name: args.sortType }).skip(args.offset).limit(args.limit);
            }
        },
        countMFAs: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}},
            resolve(parent, args, context){
                return SecureRecord.find({type: "seed", UID: context.token.UID}).count();
            }
        },
        countNotes: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}},
            resolve(parent, args,context){
                return SecureRecord.find({type: "note", UID: context.token.UID}).count();
            }
        },
        countWebsiteCredentials: {
            type:  new GraphQLList(SecureRecordType),
            args: {UID: {type: new GraphQLNonNull(GraphQLString)}},
            resolve(parent, args, context){
                return SecureRecord.find({type: "acount", UID: context.token.UID}).count();
            }
        },
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields:{
        addWebsiteCredentials:{
            type: WebsiteCredentialsType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                key: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args, context){
                let secureRecord = new SecureRecord({
                    name: args.name,
                    key: args.key,
                    recordID: null,
                    UID: context.token.UID,
                    type: "account"
                });
                secureRecord.save(function(err, updatedSecureRecord){
                    if (err){
                        console.log(err);
                        //res.status(500).send();
                    } else {
                        let websiteCredentials = new WebsiteCredentials({
                            username: args.username,
                            password: args.password,
                            UIDs: [{
                                UID: context.token.UID,
                                secureRecordID: updatedSecureRecord._id
                            }]
                        });
                        websiteCredentials.save(function(err, updatedWebsiteCredentials){
                            if (err){
                                console.log(err);
                                //res.status(500).send();
                            } else {
                                SecureRecord.findOne({_id: updatedSecureRecord._id}, function(err, foundSecureRecord){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundSecureRecord){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            foundSecureRecord.recordID = updatedWebsiteCredentials._id;
                                            foundSecureRecord.save();
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        addNote:{
            type: NoteType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                note: {type: new GraphQLNonNull(GraphQLString)},
                key: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args, context){
                let secureRecord = new SecureRecord({
                    name: null,
                    key: args.key,
                    recordID: null,
                    UID: context.token.UID,
                    type: "note"
                });
                secureRecord.save(function(err, updatedSecureRecord){
                    if (err){
                        console.log(err);
                        //res.status(500).send();
                    } else {
                        let note = new Note({
                            title: args.title,
                            note: args.note,
                            UIDs: [{
                                UID: context.token.UID,
                                secureRecordID: updatedSecureRecord._id
                            }]
                        });
                        note.save(function(err, updatedNote){
                            if (err){
                                console.log(err);
                                //res.status(500).send();
                            } else {
                                SecureRecord.findOne({_id: updatedSecureRecord._id}, function(err, foundSecureRecord){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundSecureRecord){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            foundSecureRecord.recordID = updatedNote._id;
                                            foundSecureRecord.save();
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        addSeed:{
            type: MFAType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                username: {type: new GraphQLNonNull(GraphQLString)},
                seed: {type: new GraphQLNonNull(GraphQLString)},
                key: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args, context){
                let secureRecord = new SecureRecord({
                    name: args.name,
                    key: args.key,
                    recordID: null,
                    UID: context.token.UID,
                    type: "seed"
                });
                secureRecord.save(function(err, updatedSecureRecord){
                    if (err){
                        console.log(err);
                        //res.status(500).send();
                    } else {
                        let seed = new Seed({
                            username: args.username,
                            seed: args.seed,
                            UIDs: [{
                                UID: context.token.UID,
                                secureRecordID: updatedSecureRecord._id
                            }]
                        });
                        seed.save(function(err, updatedSeed){
                            if (err){
                                console.log(err);
                                //res.status(500).send();
                            } else {
                                SecureRecord.findOne({_id: updatedSecureRecord._id}, function(err, foundSecureRecord){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundSecureRecord){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            foundSecureRecord.recordID = updatedSeed._id;
                                            foundSecureRecord.save();
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        addShare:{
            type: ShareType,
            args: {
                secureRecordID: {type: new GraphQLNonNull(GraphQLString)},
                reciever: {type: new GraphQLNonNull(GraphQLString)},
                key: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parents,args){
                encryptionKey = uuid.v4();
                let share = new Share({
                    secureRecordID: args.secureRecordID,
                    reciever: args.reciever,
                    key: args.key
                });
                return share.save();
            }
        },
        updateNote: {
            type: NoteType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                note: {type: new GraphQLNonNull(GraphQLString)},
                secureRecordID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                SecureRecord.findOne({_id: args.secureRecordID}, function(err, foundSecureRecord){
                    if(err){
                        console.log("1");
                        //res.status(500).sned();
                    } else {
                        if (!foundSecureRecord){
                            console.log("2");
                            //res.status(404).sned();
                        } else {
                            Note.findOne({_id: foundSecureRecord.recordID}, function(err, foundNote){
                                if(err){
                                    console.log("1");
                                    //res.status(500).sned();
                                } else {
                                    if (!foundNote){
                                        console.log("2");
                                        //res.status(404).sned();
                                    } else {
                                        foundNote.lastModified = new Date();
                                        foundNote.title = args.title;
                                        foundNote.note = args.note;
                                        return foundNote.save();
                                    }
                                }
                            });
                        }
                    }
                });
            }
        },
        updateCredentials: {
            type: NoteType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                secureRecordID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                SecureRecord.findOne({_id: args.secureRecordID}, function(err, foundSecureRecord){
                    if(err){
                        console.log("1");
                        //res.status(500).sned();
                    } else {
                        if (!foundSecureRecord){
                            console.log("2");
                            //res.status(404).sned();
                        } else {
                            WebsiteCredentials.findOne({_id: foundSecureRecord.recordID}, function(err, foundWebsiteCredentials){
                                if(err){
                                    console.log("1");
                                    //res.status(500).sned();
                                } else {
                                    if (!foundWebsiteCredentials){
                                        console.log("2");
                                        //res.status(404).sned();
                                    } else {
                                        foundWebsiteCredentials.username = args.username;
                                        foundWebsiteCredentials.password = args.password;
                                        foundWebsiteCredentials.save();
                                    }
                                }
                            });
                        }
                    }
                });
            }
        },
        deleteSecureRecord: {
            type: SecureRecordType,
            args: {
                secureRecordID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                SecureRecord.findOne({_id: args.secureRecordID}, function(err, foundSecureRecord){
                    if(err){
                        console.log("1");
                        //res.status(500).sned();
                    } else {
                        if (!foundSecureRecord){
                            console.log("2");
                            //res.status(404).sned();
                        } else {
                            if (foundSecureRecord.type == "account"){
                                WebsiteCredentials.findOne({_id: foundSecureRecord.recordID}, function(err, foundCredentials){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundCredentials){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            if(foundCredentials.UIDs.length == 1){
                                                WebsiteCredentials.findOneAndDelete({_id: foundSecureRecord.recordID}, function(err){
                                                    if(err){
                                                        console.log(err);
                                                        //return res.status(500).send;
                                                    }
                                                    //return res.status(200).send;
                                                })
                                            }
                                            SecureRecord.findOneAndDelete({_id: args.secureRecordID}, function(err){
                                                if(err){
                                                    console.log(err);
                                                    //return res.status(500).send;
                                                }
                                                //return res.status(200).send;
                                            })
                                        }
                                    }
                                });
                            } else if (foundSecureRecord.type == "seed"){
                                Seed.findOne({_id: foundSecureRecord.recordID}, function(err, foundSeed){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundSeed){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            if(foundSeed.UIDs.length == 1){
                                                Seed.findOneAndDelete({_id: foundSecureRecord.recordID}, function(err){
                                                    if(err){
                                                        console.log(err);
                                                        //return res.status(500).send;
                                                    }
                                                    //return res.status(200).send;
                                                })
                                            }
                                            SecureRecord.findOneAndDelete({_id: args.secureRecordID}, function(err){
                                                if(err){
                                                    console.log(err);
                                                    //return res.status(500).send;
                                                }
                                                //return res.status(200).send;
                                            })
                                        }
                                    }
                                });
                            } else if (foundSecureRecord.type == "note") {
                                Note.findOne({_id: foundSecureRecord.recordID}, function(err, foundNote){
                                    if(err){
                                        console.log("1");
                                        //res.status(500).sned();
                                    } else {
                                        if (!foundNote){
                                            console.log("2");
                                            //res.status(404).sned();
                                        } else {
                                            if(foundNote.UIDs.length == 1){
                                                Note.findOneAndDelete({_id: foundSecureRecord.recordID}, function(err){
                                                    if(err){
                                                        console.log(err);
                                                        //return res.status(500).send;
                                                    }
                                                    //return res.status(200).send;
                                                })
                                            }
                                            SecureRecord.findOneAndDelete({_id: args.secureRecordID}, function(err){
                                                if(err){
                                                    console.log(err);
                                                    //return res.status(500).send;
                                                }
                                                //return res.status(200).send;
                                            })
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        },
        deleteShare: {
            type: ShareType,
            args: {
                ShareID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                Share.findOneAndDelete({_id: args.ShareID}, function(err){
                    if(err){
                        console.log(err);
                        //return res.status(500).send;
                    }
                    //return res.status(200).send;
                })
            }
        },

    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});