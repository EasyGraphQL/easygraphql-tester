'use strict'

const _ = require('lodash')
const mocker = require('easygraphql-mock')
const assert = require('assert')
const schemaParser = require('./schemaParser')
const queryParser = require('./queryParser')

class Tester {
  constructor (schema) {
    if (!schema) {
      throw new Error('The schema is require')
    }
    this.schema = schemaParser(schema)
    this.mockedSchema = mocker(schema)
  }

  mock (query, args = {}) {
    if (!query) {
      throw new Error('The Query/Mutation to test is require')
    }

    const parsedQuery = queryParser(query, args)

    const { operationType, name } = parsedQuery

    let mock
    switch (operationType.toLowerCase()) {
      case 'query':
        // Search the query on the Schema Code parsed into an object
        const querySchema = this.schema.Query.fields.filter(el => el.name === name)
        // Create a mock and validate the query on the schema
        mock = validator(parsedQuery, this.mockedSchema.Query[name])
        // Check if the query receives args and check if the required ones are passed
        argumentsValidator(parsedQuery.arguments, querySchema[0].arguments, parsedQuery.name)
        // Return the mock of the selected fields
        return mock

      case 'mutation':
        // Search the mutation on the Schema Code parsed into an object
        const mutationSchema = this.schema.Mutation.fields.filter(el => el.name === name)
        // Create a mock and validate the mutation on the schema
        mock = validator(parsedQuery, this.mockedSchema.Mutation[name])
        // The mutation must receive a input, so must check if it receives the correct one
        inputValidator(parsedQuery, mutationSchema[0].arguments, this.schema, parsedQuery.name)
        // Return the mock of the selected fields
        return mock

      default:
        throw new Error('The operation type is not defined on the schema')
    }
  }

  test (isValid, query, args) {
    if (typeof isValid !== 'boolean') {
      throw new Error('isValid argument must be a boolean')
    }

    if (isValid) {
      this.mock(query, args)
      return assert.strictEqual(isValid, true)
    } else {
      let error
      try {
        this.mock(query, args)
      } catch (err) {
        error = err
      }

      if (!error) {
        throw new Error(`Failed, there should be an error and the passed query/mutation is valid`)
      }
      return assert.strictEqual(isValid, false)
    }
  }
}

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
    // If it is noNull, must validate the argument
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

function inputValidator ({ variables }, schemaArgs, schema, name) {
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

  // Create object to return, with all the fields mocked, and nested
  const result = {}
  query.fields.forEach(element => {
    result[element.name] = mockBuilder(element, mock, query.name)
  })

  return result
}

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

module.exports = Tester
