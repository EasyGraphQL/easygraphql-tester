'use strict'

function schemaDefinition (schema, operationType) {
  switch (operationType) {
    case 'query':
      return schema.schemaDefinition ? schema.schemaDefinition.query.field : 'Query'

    case 'mutation':
      return schema.schemaDefinition ? schema.schemaDefinition.mutation.field : 'Mutation'

    case 'subscription':
      return schema.schemaDefinition ? schema.schemaDefinition.subscription.field : 'Subscription'

    default:
      throw new Error('Invalid operation type')
  }
}

module.exports = { schemaDefinition }
