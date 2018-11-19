'use strict'

const gql = require('graphql-tag')
const isEmpty = require('lodash.isempty')

function queryBuilder (doc) {
  // Get some properties of the query/mutation

  // Get the operation type like Query/Mutation
  const operationType = doc.operation ? doc.operation : null
  // Get the operation name that the user gave to the Query/Mutation
  const operationName = doc.name && doc.name.value ? doc.name.value : null

  // The result to return will be a custom object with multiple properties, used
  // to make some validations on the test.
  const parsedType = {
    operationType,
    operationName,
    arguments: [],
    fields: []
  }

  const selections = doc.selectionSet.selections ? doc.selectionSet.selections : null
  selections.forEach(element => {
    parsedType['name'] = element.name.value
    parsedType.arguments = selectedArguments(element.arguments)
    parsedType.fields = selectedFields(element.selectionSet.selections)
  })

  return parsedType
}

function selectedArguments (args) {
  if (!args || args.length === 0) {
    return []
  }

  // Get the array of arguments on the query
  return args.map(arg => {
    return {
      name: arg.name.value,
      value: arg.value.kind === 'EnumValue' ? arg.value.value : parseFloat(arg.value.value),
      type: arg.value.kind
    }
  })
}

// Loop the selected fields to get all the nested fields
function selectedFields (selections, selected) {
  selected = []

  if (!selections) {
    return selected
  }

  selections.forEach(el => {
    const selection = {
      name: el.name.value,
      fields: []
    }
    if (!el.selectionSet) {
      return selected.push(selection)
    }
    selection.fields = selectedFields(el.selectionSet.selections, selected)
    selected.push(selection)
  })

  return selected
}

function queryParser (query, args) {
  let parsedQuery = null
  const graphQuery = gql`${query}`

  if (graphQuery.definitions[0]) {
    parsedQuery = queryBuilder(graphQuery.definitions[0])

    // If the type is mutatiom, the second argument must be a object of variables
    if (parsedQuery.operationType === 'mutation' && isEmpty(args)) {
      throw new Error('Variables are missing')
    }

    parsedQuery = Object.assign({ variables: args }, parsedQuery)
  }

  return parsedQuery
}

module.exports = queryParser
