const { GraphQLSchema, GraphQLObjectType } = require('graphql')

const GetUserQuery = require('./queries/getUser')
const CreateUserMutation = require('./mutations/createUser')

const RootQueryType = new GraphQLObjectType({
  name: 'CustomRootQuery',
  fields: () => ({
    getUser: GetUserQuery
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'CustomRootMutation',
  fields: () => ({
    createNewUser: CreateUserMutation
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

module.exports = schema
