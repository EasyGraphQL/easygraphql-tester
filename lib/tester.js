'use strict'

const mocker = require('easygraphql-mock')
const schemaParser = require('easygraphql-parser')
const assert = require('assert')
const isObject = require('lodash.isobject')
const { graphql, print } = require('graphql')
const { makeExecutableSchema } = require('graphql-tools')

const buildGraphQLSchema = require('../utils/buildGraphQLSchema')

const mock = require('../utils/mock')

class Tester {
  constructor (schema, resolvers) {
    if (!schema) {
      throw new Error('The schema is require')
    }

    let buildedSchema = schema
    if (resolvers) {
      buildedSchema = buildGraphQLSchema(schema)
      buildedSchema = makeExecutableSchema({ typeDefs: buildedSchema, resolvers })
    }

    this.schema = buildedSchema
    this.gqlSchema = buildGraphQLSchema(schema, true)
    this.parsedSchema = schemaParser(schema)
    this.mockedSchema = mocker(schema)
    this.fixture = null
    this.opts = {}
  }

  mock (opts, args = {}) {
    if (!opts || (isObject(opts) && !opts.query && !opts.kind)) {
      throw new Error('The Query/Mutation to test is require')
    }

    const operationOptions = { ...this.opts, ...opts }

    let { query, variables, fixture } = operationOptions
    if (!fixture && this.fixture) {
      operationOptions.fixture = this.fixture
    }

    query = query || opts
    args = variables || args

    return mock(this.gqlSchema, query, args, this.mockedSchema, operationOptions, this.parsedSchema)
  }

  /**
   * Validate that the query mutation is valid or not.
   * @param isValid { Boolean } - It will say if the Query/Mutation is valid or not.
   * @param query - The Query/Mutation to test.
   * @param args - In case it is a mutation, it will the input type.
   */
  test (isValid, query, args) {
    if (typeof isValid !== 'boolean') {
      throw new Error('isValid argument must be a boolean')
    }

    if (isValid) {
      this.mock(query, args)
      return assert.strictEqual(isValid, true)
    } else {
      let error
      try {
        this.mock(query, args)
      } catch (err) {
        error = err
      }

      if (!error) {
        throw new Error(`Failed, there should be an error and the passed query/mutation is valid`)
      }

      return assert.strictEqual(isValid, false)
    }
  }

  graphql (query, rootValue, contextValue, variableValues) {
    if (isObject(query)) {
      query = print(query)
    }

    return graphql(this.schema, query, rootValue, contextValue, variableValues)
  }

  setFixture (fixture, opts = {}) {
    this.opts = {
      autoMock: opts.autoMock
    }
    this.fixture = fixture
  }

  clearFixture () {
    this.opts = {}
    this.fixture = null
  }
}

module.exports = Tester
