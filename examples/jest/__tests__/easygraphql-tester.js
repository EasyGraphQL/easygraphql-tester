'use strict'

const fs = require('fs')
const path = require('path')
const EasyGraphQLTester = require('../../../lib')

const schemaCode = fs.readFileSync(path.join(__dirname, '..', 'schema', 'schema.gql'), 'utf8')
let tester

describe('Test my schema, queries and mutations', () => {
  beforeAll(() => {
    tester = new EasyGraphQLTester(schemaCode)
  })

  describe('Queries', () => {
    test('Invalid query getUser', () => {
      const invalidQuery = `
        {
          getUser {
            id
            invalidField
            familyInfo {
              father {
                email
                username
              }
            }
          }
        }
      `
      // First arg: false because the query is not valid (There is no query called getUser on the Schema)
      // Second arg: query to test
      tester.test(false, invalidQuery)
    })

    test('Should pass wtesth a valid query', () => {
      const validQuery = `
        {
          getMeByTestResult(result: 4.9) {
            email
          }
        }
      `
      // First arg: true because the query is valid
      // Second arg: query to test
      tester.test(true, validQuery)
    })
  })

  describe('Mutations', () => {
    test('Invalid input type', () => {
      const mutation = `
        mutation UpdateUserScores{
          updateUserScores {
            email
            scores
          }
        }
      `
      // First arg: false because the input value is not valid
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(false, mutation, {
        scores: ['1']
      })
    })

    test('Should pass if the input type is valid', () => {
      const mutation = `
        mutation UpdateUserScores{
          updateUserScores {
            email
            scores
          }
        }
      `
      // First arg: true because the input value is valid
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(true, mutation, {
        scores: [1]
      })
    })
  })
})
