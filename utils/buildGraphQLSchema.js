'use strict'

const { mergeTypeDefs } = require('@graphql-tools/merge')
const {
  buildSchema,
  printSchema,
  buildClientSchema,
  GraphQLSchema,
  buildASTSchema,
} = require('graphql')

function mergeTypes(types, options) {
  const schemaDefinition =
    options && typeof options.schemaDefinition === 'boolean'
      ? options.schemaDefinition
      : true

  return mergeTypeDefs(types, {
    useSchemaDefinition: schemaDefinition,
    forceSchemaDefinition: schemaDefinition,
    throwOnConflict: true,
    commentDescriptions: true,
    reverseDirectives: true,
    ...options,
  })
}

function buildGraphQLSchema(source, shouldBuildSchema) {
  let schema = source
  if (Array.isArray(source)) {
    schema = mergeTypes(source, { all: true })
  } else if (typeof source === 'object') {
    if (source instanceof GraphQLSchema) {
      schema = printSchema(source)
    } else if (source.kind === 'Document') {
      schema = printSchema(buildASTSchema(source))
    } else {
      schema = printSchema(buildClientSchema(source.data))
    }
  }

  if (shouldBuildSchema) {
    return buildSchema(schema)
  }
  return schema
}

module.exports = buildGraphQLSchema
