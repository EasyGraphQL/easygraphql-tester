'use strict'

const { mergeTypes } = require('merge-graphql-schemas')
const { buildSchema, printSchema, buildClientSchema, GraphQLSchema, buildASTSchema } = require('graphql')

function buildGraphQLSchema (source, shouldBuildSchema) {
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
