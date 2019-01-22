'use strict'

const { setFixture, setFixtureError } = require('./fixture')
const { queryField, mutationField, subscriptionField } = require('./schemaDefinition')
const { validateArgsOnNestedFields, argumentsValidator, inputValidator, validator } = require('./validator')

function mockQuery (schema, mockedSchema, parsedQuery, fixture, saveFixture, globalQueryVariables) {
  const { operationType, name, queryName, arguments: queryArgs, fields } = parsedQuery

  // The query variables should be used on all the queries.
  let queryVariables = globalQueryVariables || parsedQuery.queryVariables

  let mock
  let mockedQuery
  switch (operationType.toLowerCase()) {
    case 'query':
      // If there are errors defined on the fixture, return them. This should be, the
      // first validation because if it's going to mock an error is because there should be
      // an error, so prevent any extra validation and just return the errors.
      if (fixture && fixture.errors) {
        const errors = setFixtureError(fixture.errors)
        return { errors }
      }
      const Query = queryField(schema)
      // Search the query on the Schema Code parsed into an object
      const querySchema = schema[Query].fields.filter(el => el.name === name)
      // Create a mock and validate the query on the schema
      mock = validator(parsedQuery, mockedSchema[Query][name], schema, 'Query')
      // Validate nested types against the schema, to be sure the arguments are used,
      // also check the variables defined to be sure, those are used.
      if (Array.isArray(fields)) {
        const queryType = schema[querySchema[0].type]
        fields.forEach(element => {
          queryVariables = validateArgsOnNestedFields(element, queryType, name, queryVariables, schema)
        })
      }
      // Check if the query receives args and check if the required ones are passed
      argumentsValidator(queryArgs, querySchema[0].arguments, name, queryVariables)
      // If there are fixtures, set the values
      if (fixture && fixture.data) {
        mock = setFixture(mock, fixture.data, name)
        if (saveFixture) {
          mockedSchema[Query][name] = mock
        }
      }
      // Return the mock of the selected fields
      mockedQuery = { [queryName]: mock }
      if (globalQueryVariables) {
        return {
          globalQueryVariables: queryVariables,
          mockedQuery
        }
      }
      return mockedQuery

    case 'mutation':
    // If there are errors defined on the fixture, return them. This should be, the
      // first validation because if it's going to mock an error is because there should be
      // an error, so prevent any extra validation and just return the errors.
      if (fixture && fixture.errors) {
        const errors = setFixtureError(fixture.errors)
        return { errors }
      }
      const Mutation = mutationField(schema)
      // Search the mutation on the Schema Code parsed into an object
      const mutationSchema = schema[Mutation].fields.filter(el => el.name === name)
      // Create a mock and validate the mutation on the schema
      mock = validator(parsedQuery, mockedSchema[Mutation][name], schema, 'Mutation')
      // The mutation must receive a input, so must check if it receives the correct one
      inputValidator(parsedQuery.variables, mutationSchema[0].arguments, schema, name, queryArgs)
      // If there are fixtures, set the values
      if (fixture && fixture.data) {
        mock = setFixture(mock, fixture.data, name)
        if (saveFixture) {
          mockedSchema[Mutation][name] = mock
        }
      }
      // Return the mock of the selected fields
      mockedQuery = { [queryName]: mock }
      return mockedQuery

    case 'subscription':
      // If there are errors defined on the fixture, return them. This should be, the
      // first validation because if it's going to mock an error is because there should be
      // an error, so prevent any extra validation and just return the errors.
      if (fixture && fixture.errors) {
        const errors = setFixtureError(fixture.errors)
        return { errors }
      }
      const Subscription = subscriptionField(schema)
      // Search the subscription on the Schema Code parsed into an object
      const subscriptionSchema = schema[Subscription].fields.filter(el => el.name === name)
      // Create a mock and validate the subscription on the schema
      mock = validator(parsedQuery, mockedSchema[Subscription][name], schema, 'Subscription')
      // Validate nested types against the schema, to be sure the arguments are used,
      // also check the variables defined to be sure, those are used.
      if (Array.isArray(fields)) {
        const queryType = schema[subscriptionSchema[0].type]
        fields.forEach(element => {
          queryVariables = validateArgsOnNestedFields(element, queryType, name, queryVariables, schema)
        })
      }
      // Check if the query receives args and check if the required ones are passed
      argumentsValidator(queryArgs, subscriptionSchema[0].arguments, name, queryVariables)
      // If there are fixtures, set the values
      if (fixture && fixture.data) {
        mock = setFixture(mock, fixture.data, name)
        if (saveFixture) {
          mockedSchema[Subscription][name] = mock
        }
      }
      // Return the mock of the selected fields
      mockedQuery = { [queryName]: mock }
      if (globalQueryVariables) {
        return {
          globalQueryVariables: queryVariables,
          mockedQuery
        }
      }
      return mockedQuery

    default:
      throw new Error('The operation type is not defined on the schema')
  }
}

module.exports = mockQuery
