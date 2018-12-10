'use strict'

const mocker = require('easygraphql-mock')
const schemaParser = require('easygraphql-parser')
const assert = require('assert')
const isObject = require('lodash.isobject')
const queryParser = require('./queryParser')
const { setFixture } = require('../utils/fixture')
const { queryField, mutationField } = require('../utils/schemaDefinition')
const { argumentsValidator, inputValidator, validator } = require('../utils/validator')

class Tester {
  constructor (schema) {
    if (!schema) {
      throw new Error('The schema is require')
    }
    this.schema = schemaParser(schema)
    this.mockedSchema = mocker(schema)
  }

  mock (opts, args = {}) {
    if (!opts || (isObject(opts) && !opts.query)) {
      throw new Error('The Query/Mutation to test is require')
    }

    let { query, variables, fixture = {}, saveFixture = false } = opts

    query = query || opts
    args = variables || args

    const parsedQuery = queryParser(query, args)
    const { operationType, name, queryVariables, queryName } = parsedQuery

    let mock
    switch (operationType.toLowerCase()) {
      case 'query':
        const Query = queryField(this.schema)
        // Search the query on the Schema Code parsed into an object
        const querySchema = this.schema[Query].fields.filter(el => el.name === name)
        // Create a mock and validate the query on the schema
        mock = validator(parsedQuery, this.mockedSchema[Query][name], this.schema, 'Query')
        // Check if the query receives args and check if the required ones are passed
        argumentsValidator(parsedQuery.arguments, querySchema[0].arguments, name, queryVariables)
        // If there are fixtures, set the values
        mock = setFixture(mock, fixture)
        if (saveFixture) {
          this.mockedSchema[Query][name] = setFixture(mock, fixture)
        }
        // Return the mock of the selected fields
        return { [queryName]: mock }

      case 'mutation':
        const Mutation = mutationField(this.schema)
        // Search the mutation on the Schema Code parsed into an object
        const mutationSchema = this.schema[Mutation].fields.filter(el => el.name === name)
        // Create a mock and validate the mutation on the schema
        mock = validator(parsedQuery, this.mockedSchema[Mutation][name], this.schema, 'Mutation')
        // The mutation must receive a input, so must check if it receives the correct one
        inputValidator(parsedQuery.variables, mutationSchema[0].arguments, this.schema, name)
        // If there are fixtures, set the values
        mock = setFixture(mock, fixture)
        if (saveFixture) {
          this.mockedSchema[Mutation][name] = setFixture(mock, fixture)
        }
        // Return the mock of the selected fields
        return { [queryName]: mock }

      default:
        throw new Error('The operation type is not defined on the schema')
    }
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
