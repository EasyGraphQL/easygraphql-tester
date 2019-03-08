/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const schema = require('./schema-js')

describe('Assert test', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(schema)
  })

  describe('Should test query', () => {
    it('Invalid query getUser', () => {
      const invalidQuery = `
        {
          getUser {
            email
            name
          }
        }
      `
      // false, it is fullName no name
      tester.test(false, invalidQuery)
    })

    it('Should pass if the query is valid', () => {
      const query = `
        {
          getUser {
            email
            fullName
          }
        }
      `
      tester.test(true, query)
    })
  })

  describe('Should test mutation', () => {
    it('Invalid mutation createUser', () => {
      const mutation = `
        mutation createNewUser($input: UserInput!) {
          createNewUser(input: $input) {
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

    it('Should pass if the mutation is valid', () => {
      const mutation = `
        mutation createNewUser($input: UserInput!) {
          createNewUser(input: $input) {
            email
          }
        }
      `

      tester.test(true, mutation, {
        input: {
          email: 'test@test.com',
          username: 'demo',
          fullName: 'test',
          password: 'test'
        }
      })
    })
  })

  describe('Should mock query', () => {
    it('Should mock if the query is valid', () => {
      const query = `
        {
          getUser {
            email
            fullName
          }
        }
      `
      const { data: { getUser } } = tester.mock(query)

      expect(getUser.email).to.be.a('string')
      expect(getUser.fullName).to.be.a('string')
    })
  })

  describe('Should test GraphQL', () => {
    it('Should pass if the resolver return expected data', async () => {
      const query = `
        {
          getUser {
            email
            fullName
          }
        }
      `

      const { data: { getUser } } = await tester.graphql(query)
      expect(getUser.email).to.be.eq('demo@demo.com')
      expect(getUser.fullName).to.be.eq('demo')
    })
  })
})
