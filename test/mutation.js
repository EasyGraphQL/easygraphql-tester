'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

describe('Mutation', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(schemaCode)
  })

  describe('Should throw an error if variables are missing', () => {
    it('Should throw an error if the variables are missing', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.test(mutation)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variables are missing')
    })

    it('Should throw an error if the variables are null', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.test(mutation, null)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variables are missing')
    })

    it('Should throw an error if the variables are empty', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.test(mutation, {})
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variables are missing')
    })

    it('Should throw an error if the variables are not complete', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.test(mutation, {
          email: 'test@test.com',
          fullName: 'test',
          password: 'test'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is missing on createUser')
    })
  })

  describe('Should throw an error if a field is invalid', () => {
    it('Should throw an error with the invalid field', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              id
              email
            }
          }
        `
        tester.test(mutation, {
          email: 'test@test.com',
          username: 'test',
          fullName: 'test',
          password: 'test'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Invalid field id on createUser')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields', () => {
      const mutation = `
        mutation CreateUser{
          createUser {
            email
          }
        }
      `
      const test = tester.test(mutation, {
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })
  })
})
