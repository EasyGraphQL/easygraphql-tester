'use strict'

const { parse, validate, findDeprecatedUsages, getOperationAST, defaultTypeResolver } = require('graphql')
const { execute } = require('graphql/execution/execute')
const isObject = require('lodash.isobject')
const { schemaDefinition } = require('./schemaDefinition')
const { setFixture, setFixtureError } = require('./fixture')

function validation (schema, doc, variableValues, mock, opts, parsedSchema) {
  const { fixture } = opts

  let fixtureErrors = []
  if (fixture && fixture.errors) {
    fixtureErrors = setFixtureError(fixture.errors)
    if (fixture.data === undefined) {
      return { errors: fixtureErrors }
    } else if (fixture.data == null) {
      return { data: null, errors: fixtureErrors }
    }
  }

  if (!isObject(doc)) {
    doc = parse(doc)
  }

  const operationNames = getOperationName(doc)
  const operationNode = getOperationAST(doc)
  const operation = schemaDefinition(parsedSchema, operationNode.operation)

  let rootValue
  if (fixture) {
    rootValue = setMockFixture(mock, operation, operationNames, parsedSchema, opts)
  } else {
    rootValue = mock[operation]
  }

  const result = execute({
    schema,
    document: doc,
    variableValues,
    rootValue,
    typeResolver: defaultTypeResolver
  })

  if (opts.validateDeprecated) {
    validateDeprecated(schema, doc)
  }

  const errors = validate(schema, doc)

  result.errors = [].concat(result.errors ? result.errors : [], errors, fixtureErrors)
  if (!opts.mockErrors) {
    handleErrors(result.errors)
  }

  return result
}

function validateDeprecated (schema, doc) {
  handleErrors(findDeprecatedUsages(schema, doc))
}

function handleErrors (errors) {
  if (errors.length) {
    throw new Error(errors[0].message)
  }
}

function setMockFixture (mock, operation, parsedQuery, parsedSchema, opts) {
  const mockedFixture = Object.assign({}, mock[operation])

  if (Array.isArray(parsedQuery)) {
    parsedQuery.forEach(name => {
      const { fixture, saveFixture = false, autoMock = true } = opts

      const operationSchema = parsedSchema[operation].fields.filter(el => el.name === name)[0]
      if (!autoMock) {
        mockedFixture[name] = setFixture({}, fixture.data, name, operationSchema, parsedSchema)
      } else {
        if (fixture && fixture.data !== undefined) {
          mockedFixture[name] = setFixture(mock[operation][name], fixture.data, name, operationSchema, parsedSchema)
          if (saveFixture) {
            mock[operation][name] = mockedFixture[name]
          }
        }
      }
    })
  }
  return mockedFixture
}

function getOperationName (doc) {
  const result = doc.definitions.map(newDoc => {
    const selections = newDoc.selectionSet.selections ? newDoc.selectionSet.selections : null
    return selections.map(selection => selection.name.value)
  })

  return [].concat.apply([], result)
}

module.exports = validation
