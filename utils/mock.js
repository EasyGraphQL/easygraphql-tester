'use strict'

const { setFixture, setFixtureError } = require('./fixture')
const { queryField, mutationField, subscriptionField } = require('./schemaDefinition')
const { validateArgsOnNestedFields, argumentsValidator, inputValidator, validator } = require('./validator')

function mockQuery (schema, mockedSchema, parsedQuery, fixture, saveFixture, autoMock, globalQueryVariables, isMultipleQuery) {
  const { operationType, name, queryName, arguments: queryArgs, fields } = parsedQuery
  // The query variables should be used on all the queries.
  let queryVariables = globalQueryVariables || parsedQuery.queryVariables

  // If there are errors defined on the fixture, return them. This should be, the
  // first validation because if it's going to mock an error is because there should be
  // an error, so prevent any extra validation and just return the errors.
  let errors
  if (fixture && fixture.errors) {
    errors = setFixtureError(fixture.errors)
    if (fixture.data === undefined) {
      return { mockedQuery: { errors } }
    } else if (fixture.data == null) {
      return { mockedQuery: { data: null, errors } }
    }
  }

  let mock
  switch (operationType.toLowerCase()) {
    case 'query':
      const Query = queryField(schema)
      // Search the query on the Schema Code parsed into an object
      const querySchema = schema[Query].fields.filter(el => el.name === name)[0]
      // If the automock is disabled, set as mock the fixture after validation
      // and the validate selected fields
      if (!autoMock) {
        const mockedFixture = setFixture({}, fixture.data, name, querySchema, schema)
        mock = validator(parsedQuery, mockedFixture, schema, querySchema, 'Query', autoMock)
      } else {
        // Create a mock and validate the query on the schema
        mock = validator(parsedQuery, mockedSchema[Query][name], schema, querySchema, 'Query', autoMock)
        // If there are fixtures, set the values
        if (fixture && fixture.data !== undefined) {
          mock = setFixture(mock, fixture.data, name, querySchema, schema)
          if (saveFixture) {
            mockedSchema[Query][name] = mock
          }
        }
      }
      // Validate nested types against the schema, to be sure the arguments are used,
      // also check the variables defined to be sure, those are used.
      if (Array.isArray(fields)) {
        const queryType = schema[querySchema.type]
        fields.forEach(element => {
          queryVariables = validateArgsOnNestedFields(element, queryType, name, queryVariables, schema)
        })
      }
      // Check if the query receives args and check if the required ones are passed
      argumentsValidator(queryArgs, querySchema.arguments, name, queryVariables, isMultipleQuery)
      // Return the mock of the selected fields
      return response(queryName, mock, errors, globalQueryVariables, queryVariables)

    case 'mutation':
      const Mutation = mutationField(schema)
      // Search the mutation on the Schema Code parsed into an object
      const mutationSchema = schema[Mutation].fields.filter(el => el.name === name)[0]
      // If the automock is disabled, set as mock the fixture after validation
      // and the validate selected fields
      if (!autoMock) {
        const mockedFixture = setFixture({}, fixture.data, name, mutationSchema, schema)
        mock = validator(parsedQuery, mockedFixture, schema, mutationSchema, 'Mutation', autoMock)
      } else {
        // Create a mock and validate the mutation on the schema
        mock = validator(parsedQuery, mockedSchema[Mutation][name], schema, mutationSchema, 'Mutation', autoMock)
        // If there are fixtures, set the values
        if (fixture && fixture.data !== undefined) {
          mock = setFixture(mock, fixture.data, name, mutationSchema, schema)
          if (saveFixture) {
            mockedSchema[Mutation][name] = mock
          }
        }
      }
      inputValidator(parsedQuery.variables, mutationSchema.arguments, schema, name, queryArgs)
      // Return the mock of the selected fields
      return response(queryName, mock, errors, globalQueryVariables, queryVariables)

    case 'subscription':
      const Subscription = subscriptionField(schema)
      // Search the subscription on the Schema Code parsed into an object
      const subscriptionSchema = schema[Subscription].fields.filter(el => el.name === name)[0]
      // If the automock is disabled, set as mock the fixture after validation
      // and the validate selected fields
      if (!autoMock) {
        const mockedFixture = setFixture({}, fixture.data, name, subscriptionSchema, schema)
        mock = validator(parsedQuery, mockedFixture, schema, subscriptionSchema, 'Subscription', autoMock)
      } else {
        // Create a mock and validate the query on the schema
        mock = validator(parsedQuery, mockedSchema[Subscription][name], schema, subscriptionSchema, 'Subscription', autoMock)
        // If there are fixtures, set the values
        if (fixture && fixture.data !== undefined) {
          mock = setFixture(mock, fixture.data, name, subscriptionSchema, schema)
          if (saveFixture) {
            mockedSchema[Subscription][name] = mock
          }
        }
      }
      // Validate nested types against the schema, to be sure the arguments are used,
      // also check the variables defined to be sure, those are used.
      if (Array.isArray(fields)) {
        const queryType = schema[subscriptionSchema.type]
        fields.forEach(element => {
          queryVariables = validateArgsOnNestedFields(element, queryType, name, queryVariables, schema)
        })
      }
      // Check if the query receives args and check if the required ones are passed
      argumentsValidator(queryArgs, subscriptionSchema.arguments, name, queryVariables, isMultipleQuery)
      // Return the mock of the selected fields
      return response(queryName, mock, errors, globalQueryVariables, queryVariables)

    default:
      throw new Error('The operation type is not defined on the schema')
  }
}

function response (queryName, mock, errors, globalQueryVariables, queryVariables) {
  return Object.assign(
    {
      mockedQuery: Object.assign(
        {},
        mock === undefined ? undefined : { data: { [queryName]: mock } },
        errors ? { errors } : undefined
      )
    },
    globalQueryVariables ? { globalQueryVariables: queryVariables } : undefined
  )
}

module.exports = mockQuery
