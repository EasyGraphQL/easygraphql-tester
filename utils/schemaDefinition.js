'use strict'

/**
 * Returns the name of the root query type defined in a schema, or "Query" if
 * the schema does not explicitly specify a root query type.
 * @param schema - The GraphQL schema to read field names from.
 * @returns {string}
 */
function queryField (schema) {
  return schema.schemaDefinition ? schema.schemaDefinition.query.field : 'Query'
}

/**
 * Returns the name of the root mutation type defined in a schema, or "Mutation"
 * if the schema does not explicitly specify a root mutation type.
 * @param schema - The GraphQL schema to read field names from.
 * @returns {string}
 */
function mutationField (schema) {
  return schema.schemaDefinition ? schema.schemaDefinition.mutation.field : 'Mutation'
}

/**
 * Returns the name of the root subscription type defined in a schema, or "Subscription"
 * if the schema does not explicitly specify a root subscription type.
 * @param schema - The GraphQL schema to read field names from.
 * @returns {string}
 */
function subscriptionField (schema) {
  return schema.schemaDefinition ? schema.schemaDefinition.subscription.field : 'Subscription'
}

module.exports = { queryField, mutationField, subscriptionField }
