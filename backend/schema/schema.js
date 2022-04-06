const graphql = require('graphql');
const { Mutation } = require('./mutations');
const {RootQuery} = require('./queries');

const {
    GraphQLSchema,
} = graphql;

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
