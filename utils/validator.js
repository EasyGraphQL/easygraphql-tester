'use strict'

const isObject = require('lodash.isobject')
const isEmpty = require('lodash.isempty')

/**
 * Find if the required arguments are passed
 * @param args - The arguments that are on the query
 * @param schemaArgs - The arguments that are ong the schema
 * @param name - The name of the query, used to return an error
 * @returns {}
 */
function argumentsValidator (args, schemaArgs, name) {
  // Check if one of the passed argument is not defined on the schema and
  // throw an error
  args.forEach(arg => {
    const filteredArg = schemaArgs.filter(schemaArg => schemaArg.name === arg.name)

    if (filteredArg.length === 0) {
      throw new Error(`${arg.name} argument is not defined on ${name} arguments`)
    }
  })

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
}

function inputValidator (variables, schemaArgs, schema, name, arrCalled) {
  // If the input must be an array and it is not an array value; and, also
  // it shouldn't be a nested call made by the loop of the variables.
  if (schemaArgs[0].isArray && !Array.isArray(variables) && !arrCalled) {
    throw new Error(`The input value on ${name} must be an array`)
  }

  if (Array.isArray(variables) && !schemaArgs[0].isArray) {
    throw new Error(`The input value on ${name} is an array and it must be an object`)
  }
  // If there is an array on the input, we should loop it to access each value on it.
  if (Array.isArray(variables)) {
    return variables.forEach(inputVar => inputValidator(inputVar, schemaArgs, schema, name, true))
  }
  // The input type is a nested type, so must search it on the schema
  const inputFields = schema[schemaArgs[0].type]

  // Check if one of the passed variables is not defined on the schema and
  // throw an error
  for (const arg of Object.keys(variables)) {
    const filteredArg = inputFields.fields.filter(schemaVar => schemaVar.name === arg)

    if (filteredArg.length === 0) {
      throw new Error(`${arg} argument is not defined on ${name} Input`)
    }
  }

  // Loop to get all the required fields
  inputFields.fields.forEach(arg => {
    if (arg.noNull) {
      // Check if the input field is present on the variables
      const filteredArg = variables[arg.name]

      // If the argument is missing, there should be an error
      if (!filteredArg) {
        throw new Error(`${arg.name} argument is missing on ${name}`)
      }

      // If the argument must be an array and it is different, there should be an error
      if (arg.isArray && !Array.isArray(filteredArg)) {
        throw new Error(`${arg.name} must be an Array on ${name}`)
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
  })
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
  if (!mock) {
    throw new Error(`There is no ${query.operationType} called ${query.name} on the Schema`)
  }

  let schemaType
  if (type === 'Query') {
    schemaType = schema.Query.fields.filter(el => el.name === query.name)[0]
  } else {
    schemaType = schema.Mutation.fields.filter(el => el.name === query.name)[0]
  }
  // If the mock is array, it will loop each value, so the query can access
  // each value requested on the Query/Mutation
  if (Array.isArray(mock)) {
    return mock.map(mockVal => {
      return getResult(query, mockVal, schema, schemaType, type)
    })
  }
  // Create object to return, with all the fields mocked, and nested
  return getResult(query, mock, schema, schemaType, type)
}

function getResult (query, mock, schema, schemaType, type) {
  let result = {}
  query.fields.forEach(field => {
    if (field.inlineFragment && !schema[field.name]) {
      throw new Error(`There is no type ${field.name} on the Schema`)
    }

    if (field.inlineFragment) {
      const mockResult = {}
      field.fields.forEach(element => {
        validateSelectedFields(element, schema[field.name], schema, query.name, type)
        const result = mockBuilder(element, mock, query.name, schema)

        if (!isEmpty(result)) {
          mockResult[element.name] = result
        }
      })

      result = mockResult
    } else {
      validateSelectedFields(field, schema[schemaType.type], schema, query.name, type)
      result[field.name] = mockBuilder(field, mock, query.name, schema)
    }
  })

  return result
}

function validateSelectedFields (field, selectedSchema, schema, name, type) {
  const schemaFields = selectedSchema.fields.filter(schemaField => schemaField.name === field.name)[0]
  if (!schemaFields) {
    throw new Error(`${type} ${name}: The selected field ${field.name} doesn't exists`)
  }

  const selectedType = schema[schemaFields.type]
  if (selectedType) {
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
        if (result) {
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

      if (result) {
        mockResult[element.name] = result
      }
    })
    return mockResult
  }
}

module.exports = { argumentsValidator, inputValidator, validator }
