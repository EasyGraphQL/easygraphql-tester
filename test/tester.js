/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const gql = require('graphql-tag')
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
        query GET_ME($result: Float!){
          getMeByTestResult(result: $result) {
            email
            createdAt
          }
        }
      `
      tester.test(true, validQuery, {
        result: 4.9
      })
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
        mutation UpdateUserScores($scores: UpdateUserScoresInput!) {
          updateUserScores(scores: $scores) {
            email
            scores
          }
        }
      `
      tester.test(false, mutation, {
        scores: {
          scores: ['1']
        }
      })
    })

    it('Should pass if the mutation is valid', () => {
      const mutation = `
        mutation UpdateUserScores($scores: UpdateUserScoresInput!) {
          updateUserScores(scores: $scores) {
            email
            scores
          }
        }
      `
      tester.test(true, mutation, {
        scores: {
          scores: [1]
        }
      })
    })

    it('Should not pass if one value on the mutation input is invalid', () => {
      const mutation = `
        mutation UpdateUserScores($scores: UpdateUserScoresInput!) {
          updateUserScores(scores: $scores) {
            email
            scores
          }
        }
      `
      tester.test(false, mutation, {
        scores: {
          scores: [1],
          invalidField: true
        }
      })
    })

    it('Should pass if the input is invalid', () => {
      const mutation = `
        mutation CreateUser($input: UserInput!){
          createUser(input: $input) {
            email
          }
        }
      `

      tester.test(false, mutation, {
        input: {
          email: 'test@test.com',
          fullName: 'test',
          password: 'test'
        }
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
        input: {
          isAdmin: true
        }
      })
    })

    it('Should receive scalar as argument', () => {
      const mutation = `
        mutation {
          createTest(name: "Test", age: 20)
        }
      `

      tester.test(true, mutation)
    })

    it('Should receive scalar arr as argument', () => {
      const mutation = `
        mutation {
          createNames(names: ["Test", "Test 2"])
        }
      `

      tester.test(true, mutation)
    })

    it('Should receive scalar arr', () => {
      const mutation = gql`
        mutation ($username: String!) {
          insert_user (objects: [{username: $username}]) {
            returning {
              id
              username
            }
          }
        }
      `

      tester.test(true, mutation, {
        username: 'Test'
      })
    })

    it('Should fail if scalar expect scalar and get arr', () => {
      let error
      try {
        const mutation = `
          mutation {
            createTest(name: ["Test"], age: 20)
          }
        `

        tester.test(true, mutation)
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Argument "name" has invalid value ["Test"].')
    })

    it('Should receive scalar boolean (false) argument', () => {
      const mutation = `
        mutation {
          createTodo(completed: false)
        }
      `

      tester.test(true, mutation)
    })

    it('Should fail if the mutation doesnt receive a boolean', () => {
      const mutation = `
        mutation {
          createTodo(completed: "false")
        }
      `

      tester.test(false, mutation)
    })

    it('Should receive mutation with graphql-tag', () => {
      const mutation = gql`
        mutation {
          createTodo(completed: false)
        }
      `

      tester.test(true, mutation)
    })

    it('Should test a subscription', () => {
      const subscription = `
        subscription {
          newUsers(limit: 1) {
            id
            username
            email
          } 
        }
      `

      tester.test(true, subscription)
    })

    it('Should fail if a field on the variables is missing', () => {
      let error
      try {
        const RESET_MUTATION = `
          mutation RESET_MUTATION($demo: String!, $password: String!, $confirmPassword: String!) {
            resetPassword(resetToken: $demo, password: $password, confirmPassword: $confirmPassword) {
              id
              email
            }
          }
        `

        tester.test(true, RESET_MUTATION, {
          demo: 'jnzjkadnan',
          confirmPassword: 'aa'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Variable "$password" of required type "String!" was not provided.')
    })
  })
})
