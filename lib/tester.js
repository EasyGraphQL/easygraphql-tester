'use strict'

const mocker = require('easygraphql-mock')
const schemaParser = require('easygraphql-parser')
const assert = require('assert')
const isObject = require('lodash.isobject')
const queryParser = require('./queryParser')
const mockQuery = require('../utils/mock')

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
    if (Array.isArray(parsedQuery)) {
      const mockedQueries = {}
      parsedQuery.forEach(operation => {
        const mockedQuery = mockQuery(this.schema, this.mockedSchema, operation, fixture, saveFixture)
        Object.assign(mockedQueries, mockedQuery)
      })

      return mockedQueries
    }

    return mockQuery(this.schema, this.mockedSchema, parsedQuery, fixture, saveFixture)
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
