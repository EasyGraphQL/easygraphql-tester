'use strict'

const mocker = require('easygraphql-mock')
const schemaParser = require('easygraphql-parser')
const assert = require('assert')
const isObject = require('lodash.isobject')
const queryParser = require('./queryParser')
const mockQuery = require('../utils/mock')
const mergeWith = require('lodash.mergewith')

function mergeQueries (objValue, srcValue, key) {
  if (Array.isArray(objValue) && key !== 'errors') {
    return objValue.concat(srcValue)
  }
}

class Tester {
  constructor (schema) {
    if (!schema) {
      throw new Error('The schema is require')
    }
    this.schema = schemaParser(schema)
    this.mockedSchema = mocker(schema)
  }

  mock (opts, args = {}) {
    if (!opts || (isObject(opts) && !opts.query && !opts.kind)) {
      throw new Error('The Query/Mutation to test is require')
    }

    let { query, variables, fixture, saveFixture = false } = opts

    query = query || opts
    args = variables || args

    const parsedQuery = queryParser(query, args)
    // If there are multiples queries on one operation, loop them and mock those
    // queries
    if (Array.isArray(parsedQuery) && parsedQuery.length) {
      const mockedQueries = {}
      // The query variables are the same for all the queries, so the first one
      // is going to be the same for all
      let queryVariables = parsedQuery[0].queryVariables
      parsedQuery.forEach(operation => {
        const { mockedQuery, globalQueryVariables } = mockQuery(
          this.schema,
          this.mockedSchema,
          operation,
          fixture,
          saveFixture,
          queryVariables,
          true
        )
        // Set the global query variables as the query variables
        queryVariables = globalQueryVariables
        mergeWith(mockedQueries, mockedQuery, mergeQueries)
      })

      if (queryVariables.length) {
        throw new Error(`Variable "$${queryVariables[0].name}" is never used in operation "${parsedQuery[0].operationName}"`)
      }
      return mockedQueries
    }

    return mockQuery(this.schema, this.mockedSchema, parsedQuery, fixture, saveFixture).mockedQuery
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
}

module.exports = Tester
