'use strict'

/**
 * Returns the name of the root query type defined in a schema, or "Query" if
 * the schema does not explicitly specify a root query type.
 * @returns {string}
 */
function queryField (schema) {
  return schema.schemaDefinition ? schema.schemaDefinition.query.field : 'Query'
}

/**
 * Returns the name of the root mutation type defined in a schema, or "Mutation"
 * if the schema does not explicitly specify a root mutation type.
 * @returns {string}
 */
function mutationField (schema) {
  return schema.schemaDefinition ? schema.schemaDefinition.mutation.field : 'Mutation'
}

module.exports = { queryField, mutationField }
