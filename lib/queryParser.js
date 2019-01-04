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
    queryVariables: [],
    arguments: [],
    fields: []
  }

  parsedType.queryVariables = doc.variableDefinitions.map(variable => {
    return {
      name: variable.variable.name.value
    }
  })

  const selections = doc.selectionSet.selections ? doc.selectionSet.selections : null
  selections.forEach(element => {
    parsedType['queryName'] = getQueryName(element)
    parsedType['name'] = element.name.value
    parsedType.arguments = selectedArguments(element.arguments)
    parsedType.fields = element.selectionSet ? selectedFields(element.selectionSet.selections) : element.name.value
  })

  return parsedType
}

function getQueryName (query) {
  if (query.alias && query.alias.value) {
    return query.alias.value
  }

  return query.name.value
}

function selectedArguments (args) {
  if (!args || args.length === 0) {
    return []
  }

  // Get the array of arguments on the query
  return args.map(arg => {
    return {
      name: arg.name.value,
      value: getArgValue(arg),
      type: arg.value.kind
    }
  })
}

function getArgValue (arg) {
  switch (arg.value.kind) {
    case 'EnumValue':
    case 'StringValue':
    case 'BooleanValue':
      return arg.value.value

    case 'ListValue':
      return arg.value.values

    case 'Variable':
      return arg.value.name.value

    case 'IntValue':
      return parseFloat(arg.value.value)

    // If the arg is an object, check if it has multiples values
    case 'ObjectValue':
      const argVal = arg.value.fields.map(arg => getArgValue(arg))
      return argVal.length === 1 ? argVal[0] : [].concat.apply([], argVal)

    default:
  }
}

// Loop the selected fields to get all the nested fields
function selectedFields (selections, selected) {
  selected = []

  if (!selections) {
    return selected
  }

  selections.forEach(el => {
    const selection = {
      fields: []
    }

    if (el.kind === 'InlineFragment') {
      selection['name'] = el.typeCondition.name.value
      selection['inlineFragment'] = true
    } else {
      selection['name'] = el.name.value
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

    let variables
    // If it is a mutation, and there are arguments on the mutation operation and the
    // passed arguments are not an array, it should loop the arguments and set
    // the value of each argument in case the user is not using variables.
    if (
      parsedQuery.operationType === 'mutation' &&
      Array.isArray(parsedQuery.arguments) &&
      !Array.isArray(args)
    ) {
      const varsOnArguments = {}
      parsedQuery.arguments.forEach(arg => {
        if (arg.type !== 'Variable') {
          varsOnArguments[arg.name] = arg.value
        }
      })

      // The argument values will be replaced with the input value, in case there is one.
      variables = Object.assign({}, varsOnArguments, args)
    } else {
      variables = args
    }

    // If the type is mutatiom, the second argument must be a object of variables
    if (parsedQuery.operationType === 'mutation' && isEmpty(variables)) {
      throw new Error('Variables are missing')
    }

    parsedQuery = Object.assign({ variables }, parsedQuery)
  }

  return parsedQuery
}

module.exports = queryParser
