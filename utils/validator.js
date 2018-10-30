'use strict'

const _ = require('lodash')

/**
 * Find if the required arguments are passed
 * @param args - The arguments that are on the query
 * @param schemaArgs - The arguments that are ong the schema
 * @param name - The name of the query, used to return an error
 * @returns {}
 */
function argumentsValidator (args, schemaArgs, name) {
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
  // If there is an array on the input, we should loop it to access each value on it.
  if (Array.isArray(variables)) {
    return variables.forEach(inputVar => inputValidator(inputVar, schemaArgs, schema, name, true))
  }
  // The input type is a nested type, so must search it on the schema
  const inputFields = schema[schemaArgs[0].type]
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

function validator (query, mock) {
  // If the query name is missing on the mock, there should be an error because
  // it is not defined on the schema
  if (!mock) {
    throw new Error(`There is no ${query.operationType} called ${query.name} on the Schema`)
  }

  // If the mock is array, it will loop each value, so the query can access
  // each value requested on the Query/Mutation
  if (Array.isArray(mock)) {
    return mock.map(mockVal => {
      const result = {}
      query.fields.forEach(field => {
        result[field.name] = mockBuilder(field, mockVal, query.name)
      })

      return result
    })
  }
  // Create object to return, with all the fields mocked, and nested
  const result = {}
  query.fields.forEach(field => {
    result[field.name] = mockBuilder(field, mock, query.name)
  })

  return result
}

// This is going to be a recursive method that will search nested values on nested
// types.
function mockBuilder (field, mock, name, mockResult) {
  if (field.fields.length === 0) {
    if (_.isObject(mock[field.name])) {
      if (Array.isArray(mock[field.name]) && _.isObject(mock[field.name][0])) {
        throw new Error(`${name}: Must select field on ${field.name}`)
      } else if (!Array.isArray(mock[field.name])) {
        throw new Error(`${name}: Must select field on ${field.name}`)
      }
    }

    if (!mock[field.name] && mock[field.name] !== null && typeof mock[field.name] !== 'boolean') {
      throw new Error(`Invalid field ${field.name} on ${name}`)
    }

    return mock[field.name]
  }

  // If the mock is an array, it will loop each value, to access the requested
  // data.
  if (mock[field.name] && Array.isArray(mock[field.name])) {
    const arrField = []
    mock[field.name].forEach(el => {
      mockResult = {}
      field.fields.forEach(element => {
        mockResult[element.name] = mockBuilder(element, el, name, mockResult)
      })
      arrField.push(mockResult)
    })
    return arrField
  } else {
    mockResult = {}
    field.fields.forEach(element => {
      mockResult[element.name] = mockBuilder(element, mock[field.name], name, mockResult)
    })
    return mockResult
  }
}

module.exports = { argumentsValidator, inputValidator, validator }
