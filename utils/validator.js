'use strict'

const isObject = require('lodash.isobject')
const isEmpty = require('lodash.isempty')
const { queryField, mutationField, subscriptionField } = require('./schemaDefinition')

function validateArgsOnNestedFields (field, queryType, name, queryVariables, schema) {
  const type = queryType.fields.filter(nestedField => nestedField.name === field.name)

  if (type[0]) {
    queryVariables = argumentsValidator(field.arguments, type[0].arguments, name, queryVariables, true)
  }

  field.fields.forEach(nestedField => {
    // If the nestedtype is another type, set it as queryType for the nested validation of the values.
    if (type[0] && schema[type[0].type]) {
      queryVariables = validateArgsOnNestedFields(nestedField, schema[type[0].type], name, queryVariables, schema)
    } else {
      queryVariables = validateArgsOnNestedFields(nestedField, queryType, name, queryVariables, schema)
    }
  })

  return queryVariables
}

/**
 * Find if the required arguments are passed
 * @param args - The arguments that are on the query
 * @param schemaArgs - The arguments that are ong the schema
 * @param name - The name of the query, used to return an error
 * @returns {}
 */
function argumentsValidator (args, schemaArgs, name, queryVariables, validatingField) {
  // Check if one of the passed argument is not defined on the schema and
  // throw an error
  queryVariables = queryVariables || []
  args.forEach(arg => {
    const filteredArg = schemaArgs.filter(schemaArg => schemaArg.name === arg.name)

    if (filteredArg.length === 0) {
      throw new Error(`${arg.name} argument is not defined on ${name} arguments`)
    }

    // Take out from the queryVariables the ones that are used.
    queryVariables = queryVariables.filter(queryVariable => {
      // Validate if the variables on the arguments in case is an array
      // are defined on the query
      if (Array.isArray(arg.value) && arg.value.indexOf(queryVariable.name) >= 0) {
        return false
      }

      if (Array.isArray(arg.value)) {
        const arrVals = arg.value.map(val => getArgValue(val))
        return arrVals.indexOf(queryVariable.name) < 0
      }
      return arg.value !== queryVariable.name
    })
  })

  // If there is any field on queryVariables and it's the final validation after
  // validating the nested types on `validateArgsOnNestedFields` there should
  // be an error, the defined variables are not used at all
  if (!validatingField && queryVariables.length) {
    throw new Error(`${queryVariables[0].name} variable is not defined on ${name} arguments`)
  }

  // Loop all the arguments defined on the schema
  schemaArgs.forEach(arg => {
    // If arg can't be null; make multiples validations.
    if (arg.noNull) {
      // Filter the passed argument that come from the query
      const filteredArg = args.filter(mockArg => mockArg.name === arg.name)

      // If the argument is missing, there should be an error
      if (filteredArg.length === 0) {
        throw new Error(`${arg.name} argument is missing on ${name}`)
      }

      if (filteredArg[0].type === 'Variable') {
        return
      }

      // If the argument must be an array and it is different, there should be an error
      if (arg.isArray && !Array.isArray(filteredArg[0].value)) {
        throw new Error(`${arg.name} must be an Array on ${name}`)
      }

      // Switch the different type of arguments, and check if it is the same as the one on the schema
      switch (filteredArg[0].type) {
        case 'EnumValue':
          if (arg.type !== 'String' && arg.type !== 'ID') {
            throw new Error(`${arg.name} argument is not type ${arg.type}`)
          }
          break

        case 'IntValue':
          if (arg.type !== 'Int') {
            throw new Error(`${arg.name} argument is not type ${arg.type}`)
          }
          break

        case 'FloatValue':
          if (arg.type !== 'Float') {
            throw new Error(`${arg.name} argument is not type ${arg.type}`)
          }
          break

        case 'BooleanValue':
          if (arg.type !== 'Boolean') {
            throw new Error(`${arg.name} argument is not type ${arg.type}`)
          }
          break

        default:
          break
      }
    }
  })
  return queryVariables
}

// If the values of the arguments are on an array it is going to get the nested values
function getArgValue (arg) {
  switch (arg.kind) {
    case 'EnumValue':
    case 'StringValue':
    case 'BooleanValue':
      return arg.value

    case 'ListValue':
      return arg.values.map(val => val.value)

    case 'Variable':
      return arg.name.value

    case 'IntValue':
      return parseFloat(arg.value)

    // If the arg is an object, check if it has multiples values
    case 'ObjectValue':
      const argVal = arg.fields.map(arg => getArgValue(arg))
      return argVal.length === 1 ? argVal[0] : [].concat.apply([], argVal)

    case 'ObjectField':
      return getArgValue(arg.value)

    default:
  }
}

function inputValidator (variables, schemaArgs, schema, name, queryArgs, arrCalled) {
  if (queryArgs && Array.isArray(queryArgs)) {
    queryArgs.forEach(queryArg => {
      const mutationVariables = schemaArgs.filter(arg => arg.name === queryArg.name)

      if (mutationVariables.length === 0) {
        throw new Error(`${queryArg.name} argument is defined on the mutation and it's missing on the document ${name}`)
      }
    })
  }

  schemaArgs.forEach(schemaArg => {
    // If the input must be an array and it is not an array value; and, also
    // it shouldn't be a nested call made by the loop of the variables.
    const nestedType = schema[schemaArg.type]
    let schemaVar = arrCalled ? variables : variables[schemaArg.name]

    // If it can be null, and is a nested call or the variables doesn't exist, it
    // means that there is no values for the input
    if (!schemaArg.noNull && (arrCalled || typeof schemaVar === 'undefined')) {
      return
    }

    if (schemaArg.noNull) {
      const mutationVariables = queryArgs.filter(arg => {
        // If the user pass the input values with the name of the variable, set it to
        // the variable value.
        if (variables && arg.type === 'Variable' && variables[arg.value] && arg.name === schemaArg.name) {
          schemaVar = variables[arg.value]
        }

        // If the user pass the input values with the name of the variable and is an
        // array, set it to the variable value.
        if (
          variables &&
          Array.isArray(arg.value) &&
          arg.value[0].kind === 'Variable' &&
          variables[arg.value[0].name.value] &&
          arg.name === schemaArg.name
        ) {
          schemaVar = variables[arg.value[0].name.value]
        }

        return arg.name === schemaArg.name
      })

      if (mutationVariables.length === 0) {
        throw new Error(`${schemaArg.name} argument is missing on ${name}`)
      }

      // If the argument is missing, there should be an error
      if (typeof schemaVar === 'undefined') {
        throw new Error(`${schemaArg.name} values are missing on ${name}`)
      }
    }

    if (nestedType && schemaArg.isArray && !Array.isArray(schemaVar) && !arrCalled) {
      throw new Error(`The input value on ${name} must be an array`)
    }

    if (Array.isArray(schemaVar) && !schemaArg.isArray) {
      throw new Error(`The input value on ${name} is an array and it must be an object`)
    }
    // If there is an array on the input, we should loop it to access each value on it.
    if (Array.isArray(schemaVar)) {
      return schemaVar.forEach(inputVar => inputValidator(inputVar, schemaArgs, schema, name, queryArgs, true))
    }

    let inputFields
    // if the input type is a nested type, so must search it on the schema
    if (nestedType) {
      inputFields = nestedType.fields
    } else {
      inputFields = schemaArg
    }

    // Check if one of the passed schemaVar is not defined on the schema and
    // throw an error, also check that the object is not a GQL object
    if (isObject(schemaVar) && !schemaVar.kind && !schemaVar.value && !schemaVar.block) {
      for (const arg of Object.keys(schemaVar)) {
        const filteredArg = inputFields.filter(schemaVar => schemaVar.name === arg)
        if (filteredArg.length === 0) {
          throw new Error(`${arg} argument is not defined on ${name} Input`)
        }
      }
    }

    // Loop to get all the required fields
    if (Array.isArray(inputFields)) {
      inputFields.forEach(arg => {
        validateInputArg(arg, schemaVar, name, arrCalled)
      })
    } else {
      validateInputArg(inputFields, schemaVar, name, arrCalled, true)
    }
  })
}

function validateInputArg (arg, schemaVar, name, arrCalled, isScalar) {
  if (arg.noNull) {
    // Check if the input field is present on the schemaVar
    const filteredArg = isObject(schemaVar) ? schemaVar[arg.name] : schemaVar

    // If the argument is missing, there should be an error
    if (!isScalar && typeof filteredArg === 'undefined') {
      throw new Error(`${arg.name} argument is missing on ${name}`)
    }

    // If the argument must be an array and it is different, there should be an error
    // If it is arrCalled it means it is an array, should not validate.
    if (!arrCalled && arg.isArray && !Array.isArray(filteredArg)) {
      throw new Error(`${arg.name} must be an Array on ${name}`)
    }

    // If the value shouldn't be an array but it is, return error.
    if (!arg.isArray && Array.isArray(filteredArg)) {
      throw new Error(`${arg.name} is an Array and it shouldn't be one ${name}`)
    }

    if (Array.isArray(filteredArg)) {
      filteredArg.forEach(arrArg => {
        try {
          validateInputType(arg, arrArg)
        } catch (err) {
          throw err
        }
      })
    } else {
      try {
        validateInputType(arg, filteredArg)
      } catch (err) {
        throw err
      }
    }
  }
}

function validateInputType (arg, filteredArg) {
  // Switch the different type of arguments, and check if it is the same as the one on the schema
  switch (typeof filteredArg) {
    case 'number':
      if (arg.type !== 'Int' && arg.type !== 'Float') {
        throw new Error(`${arg.name} argument is not type ${arg.type}`)
      }
      break

    case 'string':
      if (arg.type !== 'String' && arg.type !== 'ID') {
        throw new Error(`${arg.name} argument is not type ${arg.type}`)
      }
      break

    case 'boolean':
      if (arg.type !== 'Boolean') {
        throw new Error(`${arg.name} argument is not type ${arg.type}`)
      }
      break

    default:
      break
  }
}

function validator (query, mock, schema, type) {
  // If the query name is missing on the mock, there should be an error because
  // it is not defined on the schema
  if (typeof mock === 'undefined') {
    throw new Error(`There is no ${query.operationType} called ${query.name} on the Schema`)
  }

  let schemaType
  if (type === 'Query') {
    schemaType = schema[queryField(schema)].fields.filter(el => el.name === query.name)[0]
  } else if (type === 'Mutation') {
    schemaType = schema[mutationField(schema)].fields.filter(el => el.name === query.name)[0]
  } else {
    schemaType = schema[subscriptionField(schema)].fields.filter(el => el.name === query.name)[0]
  }
  // If the mock is array, it will loop each value, so the query can access
  // each value requested on the Query/Mutation
  if (Array.isArray(mock)) {
    const result = []

    mock.forEach(mockVal => {
      const mockResult = getResult(query, mockVal, schema, schemaType, type)
      if (mockResult && isObject(mockResult && isEmpty(mockResult))) {
        return
      }
      result.push(mockResult)
    })
    return result
  }
  // Create object to return, with all the fields mocked, and nested
  return getResult(query, mock, schema, schemaType, type)
}

function getResult (query, mock, schema, schemaType, type) {
  let result = {}

  if (!Array.isArray(query.fields)) {
    return mock
  }

  query.fields.forEach(field => {
    if (field.inlineFragment && !schema[field.name]) {
      throw new Error(`There is no type ${field.name} on the Schema`)
    }

    if (field.inlineFragment) {
      const mockResult = {}
      field.fields.forEach(element => {
        validateSelectedFields(element, schema[field.name], schema, query.name, type)
        const result = mockBuilder(element, mock, query.name, schema)

        if (isObject(result) && !isEmpty(result)) {
          mockResult[element.name] = result
        } else if ((result === null || result || typeof result === 'boolean') && !isObject(result)) {
          mockResult[element.name] = result
        }
      })
      result = Object.assign(result, mockResult)
    } else {
      validateSelectedFields(field, schema[schemaType.type], schema, query.name, type)
      result[field.name] = mockBuilder(field, mock, query.name, schema)
    }
  })

  return result
}

function validateSelectedFields (field, selectedSchema, schema, name, type) {
  if (field.name === '__typename') return

  const schemaFields = selectedSchema.fields.filter(schemaField => schemaField.name === field.name)[0]
  if (!schemaFields) {
    throw new Error(`${type} ${name}: The selected field ${field.name} doesn't exists`)
  }

  const selectedType = schema[schemaFields.type]
  if (selectedType && selectedType.type !== 'ScalarTypeDefinition') {
    if (isObject(selectedType) && field.fields.length === 0 && selectedType.values.length === 0) {
      throw new Error(`${type} ${name}: There should be a selected field on ${field.name}`)
    }

    field.fields.forEach(el => {
      return validateSelectedFields(el, schema[schemaFields.type], schema, name, type)
    })
  }
}

// This is going to be a recursive method that will search nested values on nested
// types.
function mockBuilder (field, mock, name) {
  if (!mock) {
    return
  }

  if (field.fields.length === 0) {
    return mock[field.name]
  }

  // If the mock is an array, it will loop each value, to access the requested
  // data.
  if (mock[field.name] && Array.isArray(mock[field.name])) {
    const arrField = []
    mock[field.name].forEach(el => {
      const mockResult = {}
      field.fields.forEach(element => {
        const result = mockBuilder(element, el, name)
        if (typeof result !== 'undefined') {
          mockResult[element.name] = result
        }
      })

      if (!isEmpty(mockResult)) {
        arrField.push(mockResult)
      }
    })
    return arrField
  } else {
    const mockResult = {}
    field.fields.forEach(element => {
      const result = mockBuilder(element, mock[field.name], name)

      if (typeof result !== 'undefined') {
        mockResult[element.name] = result
      }
    })
    return mockResult
  }
}

module.exports = { validateArgsOnNestedFields, argumentsValidator, inputValidator, validator }
