/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

describe('Assert test', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester([userSchema, familySchema])
  })

  describe('Should pass if the query is invalid', () => {
    it('Invalid query getUser', () => {
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
      tester.test(false, invalidQuery)
    })

    it('Should pass if the query is valid', () => {
      const validQuery = `
        {
          getMeByTestResult(result: 4.9) {
            email
          }
        }
      `
      tester.test(true, validQuery)
    })

    it('Should not pass if the query arg is invalid', () => {
      const validQuery = `
        {
          getMeByTestResult(invalidField: 4.9) {
            email
          }
        }
      `
      tester.test(false, validQuery)
    })

    it('Should pass if the mutation is invalid', () => {
      const mutation = `
        mutation UpdateUserScores{
          updateUserScores {
            email
            scores
          }
        }
      `
      tester.test(false, mutation, {
        scores: ['1']
      })
    })

    it('Should pass if the mutation is valid', () => {
      const mutation = `
        mutation UpdateUserScores{
          updateUserScores {
            email
            scores
          }
        }
      `
      tester.test(true, mutation, {
        scores: [1]
      })
    })

    it('Should not pass if one value on the mutation input is invalid', () => {
      const mutation = `
        mutation UpdateUserScores{
          updateUserScores {
            email
            scores
          }
        }
      `
      tester.test(false, mutation, {
        scores: [1],
        invalidField: true
      })
    })

    it('Should pass if the input is invalid', () => {
      const mutation = `
        mutation CreateUser{
          createUser {
            email
          }
        }
      `

      tester.test(false, mutation, {
        email: 'test@test.com',
        fullName: 'test',
        password: 'test'
      })
    })

    it('Should return an error if the isValid field is different from boolean', () => {
      let error
      try {
        const validQuery = `
          {
            getMeByTestResult(result: 4.9) {
              email
            }
          }
        `
        tester.test('yes', validQuery)
      } catch (err) {
        error = err
      }

      if (!error) {
        throw new Error('There should be an error')
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('isValid argument must be a boolean')
    })

    it('Should return an error if the query is valid and the argument is false', () => {
      let error
      try {
        const validQuery = `
          {
            getMeByTestResult(result: 4.9) {
              email
            }
          }
        `
        tester.test(false, validQuery)
      } catch (err) {
        error = err
      }

      if (!error) {
        throw new Error('There should be an error')
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Failed, there should be an error and the passed query/mutation is valid')
    })

    it('Should pass query with union', () => {
      const query = `
        {
          search(id: "1") {
            ... on User {
              id
            }
            ... on FamilyInfo {
              id
              father {
                username
              }
              brothers {
                username
              }
            }
          }
        }
      `

      tester.test(true, query)
    })

    it('Should pass if it returns a string', () => {
      const query = `
        {
          getString
        }
      `

      tester.test(true, query)
    })

    it('Should pass if it returns a Int', () => {
      const query = `
        {
          getInt
        }
      `

      tester.test(true, query)
    })

    it('Should pass if it returns a Boolean', () => {
      const mutation = `
        mutation CreateBoolean($input: IsAdminInput!) {
          createBoolean(input: $input)
        }
      `

      tester.test(true, mutation, {
        isAdmin: true
      })
    })
  })
})
