'use strict'

const { parse, validate, findDeprecatedUsages, getOperationAST } = require('graphql')
const {
  UniqueOperationNamesRule,
  LoneAnonymousOperationRule,
  SingleFieldSubscriptionsRule,
  KnownTypeNamesRule,
  FragmentsOnCompositeTypesRule,
  VariablesAreInputTypesRule,
  ScalarLeafsRule,
  FieldsOnCorrectTypeRule,
  UniqueFragmentNamesRule,
  KnownFragmentNamesRule,
  NoUnusedFragmentsRule,
  PossibleFragmentSpreadsRule,
  NoFragmentCyclesRule,
  UniqueVariableNamesRule,
  NoUndefinedVariablesRule,
  NoUnusedVariablesRule,
  UniqueDirectivesPerLocationRule,
  KnownArgumentNamesRule,
  UniqueArgumentNamesRule,
  ValuesOfCorrectTypeRule,
  ProvidedRequiredArgumentsRule,
  VariablesInAllowedPositionRule,
  OverlappingFieldsCanBeMergedRule,
  UniqueInputFieldNamesRule
} = require('graphql/validation')
const { execute } = require('graphql/execution/execute')
const isObject = require('lodash.isobject')
const { schemaDefinition } = require('./schemaDefinition')
const { setFixture, setFixtureError } = require('./fixture')

function mock (schema, doc, variableValues, mock, opts, parsedSchema) {
  const { fixture } = opts

  if (!isObject(doc)) {
    doc = parse(doc)
  }

  const operationNode = getOperationAST(doc)
  const operation = schemaDefinition(parsedSchema, operationNode.operation)

  let rootValue
  let fixtureErrors = []
  if (fixture) {
    if (fixture.errors) {
      fixtureErrors = setFixtureError(fixture.errors)
      if (fixture.data === undefined) {
        return { errors: fixtureErrors }
      } else if (fixture.data == null) {
        return { data: null, errors: fixtureErrors }
      }
    }

    const operationNames = getOperationName(doc)
    rootValue = setFixture(mock, operation, operationNames, parsedSchema, opts)
  } else {
    rootValue = mock[operation]
  }

  const result = execute({
    schema,
    document: doc,
    variableValues,
    rootValue
  })

  if (opts.validateDeprecated) {
    validateDeprecated(schema, doc)
  }

  // Ignore KnownDirectivesRule
  const rules = [
    UniqueOperationNamesRule,
    LoneAnonymousOperationRule,
    SingleFieldSubscriptionsRule,
    KnownTypeNamesRule,
    FragmentsOnCompositeTypesRule,
    VariablesAreInputTypesRule,
    ScalarLeafsRule,
    FieldsOnCorrectTypeRule,
    UniqueFragmentNamesRule,
    KnownFragmentNamesRule,
    NoUnusedFragmentsRule,
    PossibleFragmentSpreadsRule,
    NoFragmentCyclesRule,
    UniqueVariableNamesRule,
    NoUndefinedVariablesRule,
    NoUnusedVariablesRule,
    UniqueDirectivesPerLocationRule,
    KnownArgumentNamesRule,
    UniqueArgumentNamesRule,
    ValuesOfCorrectTypeRule,
    ProvidedRequiredArgumentsRule,
    VariablesInAllowedPositionRule,
    OverlappingFieldsCanBeMergedRule,
    UniqueInputFieldNamesRule
  ]

  const errors = validate(schema, doc, rules)

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

function getOperationName (doc) {
  const result = doc.definitions.map(newDoc => {
    const selections = newDoc.selectionSet.selections ? newDoc.selectionSet.selections : null
    return selections.map(selection => selection.name.value)
  })

  return [].concat.apply([], result)
}

module.exports = mock
