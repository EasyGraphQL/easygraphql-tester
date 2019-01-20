'use strict'

const { setFixture } = require('./fixture')
const { queryField, mutationField, subscriptionField } = require('./schemaDefinition')
const { argumentsValidator, inputValidator, validator } = require('./validator')

function mockQuery (schema, mockedSchema, parsedQuery, fixture, saveFixture) {
  const { operationType, name, queryVariables, queryName, arguments: queryArgs } = parsedQuery

  let mock
  switch (operationType.toLowerCase()) {
    case 'query':
      const Query = queryField(schema)
      // Search the query on the Schema Code parsed into an object
      const querySchema = schema[Query].fields.filter(el => el.name === name)
      // Create a mock and validate the query on the schema
      mock = validator(parsedQuery, mockedSchema[Query][name], schema, 'Query')
      // Check if the query receives args and check if the required ones are passed
      argumentsValidator(parsedQuery.arguments, querySchema[0].arguments, name, queryVariables)
      // If there are fixtures, set the values
      mock = setFixture(mock, fixture)
      if (saveFixture) {
        mockedSchema[Query][name] = mock
      }
      // Return the mock of the selected fields
      return { [queryName]: mock }

    case 'mutation':
      const Mutation = mutationField(schema)
      // Search the mutation on the Schema Code parsed into an object
      const mutationSchema = schema[Mutation].fields.filter(el => el.name === name)
      // Create a mock and validate the mutation on the schema
      mock = validator(parsedQuery, mockedSchema[Mutation][name], schema, 'Mutation')
      // The mutation must receive a input, so must check if it receives the correct one
      inputValidator(parsedQuery.variables, mutationSchema[0].arguments, schema, name, queryArgs)
      // If there are fixtures, set the values
      mock = setFixture(mock, fixture)
      if (saveFixture) {
        mockedSchema[Mutation][name] = mock
      }
      // Return the mock of the selected fields
      return { [queryName]: mock }

    case 'subscription':
      const Subscription = subscriptionField(schema)
      // Search the subscription on the Schema Code parsed into an object
      const subscriptionSchema = schema[Subscription].fields.filter(el => el.name === name)
      // Create a mock and validate the subscription on the schema
      mock = validator(parsedQuery, mockedSchema[Subscription][name], schema, 'Subscription')
      // Check if the subscription receives args and check if the required ones are passed
      argumentsValidator(parsedQuery.arguments, subscriptionSchema[0].arguments, name, queryVariables)
      // If there are fixtures, set the values
      mock = setFixture(mock, fixture)
      if (saveFixture) {
        mockedSchema[Subscription][name] = mock
      }
      // Return the mock of the selected fields
      return { [queryName]: mock }

    default:
      throw new Error('The operation type is not defined on the schema')
  }
}

module.exports = mockQuery
