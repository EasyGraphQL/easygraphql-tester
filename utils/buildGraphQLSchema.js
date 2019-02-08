'use strict'

const { mergeTypes } = require('merge-graphql-schemas')
const { buildSchema, printSchema, buildClientSchema, GraphQLSchema } = require('graphql')

function buildGraphQLSchema (source) {
  let schema = source
  if (Array.isArray(source)) {
    schema = mergeTypes(source, { all: true })
  } else if (typeof source === 'object') {
    if (source instanceof GraphQLSchema) {
      schema = printSchema(source)
    } else {
      source = source.data ? source.data : source
      schema = printSchema(buildClientSchema(source))
    }
  }

  return buildSchema(schema)
}

module.exports = buildGraphQLSchema
