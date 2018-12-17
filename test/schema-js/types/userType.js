const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql')

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => {
    return {
      email: { type: GraphQLNonNull(GraphQLString) },
      username: { type: GraphQLNonNull(GraphQLString) },
      fullName: { type: GraphQLNonNull(GraphQLString) }
    }
  }
})

module.exports = UserType
