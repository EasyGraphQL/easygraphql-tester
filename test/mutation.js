/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
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
        tester.mock(mutation)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variables are missing')
    })

    it('Should throw an error if the variables are missing', () => {
      let error
      try {
        const mutation = `
          mutation CreateUsers {
            createUsers {
              email
            }
          }
        `
        tester.mock(mutation, [])
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
        tester.mock(mutation, null)
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
        tester.mock(mutation, {})
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
        tester.mock(mutation, {
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
        tester.mock(mutation, {
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

  describe('Should throw an error if a input field is different', () => {
    it('Should throw an error if the input is number and it must be a string', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.mock(mutation, {
          email: 'test@test.com',
          username: 1,
          fullName: 'test',
          password: 'test'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is not type String')
    })

    it('Should throw an error if the input is boolean and it must be a string', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.mock(mutation, {
          email: 'test@test.com',
          username: true,
          fullName: 'test',
          password: 'test'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is not type String')
    })

    it('Should throw an error if the input is not an array of values', () => {
      let error
      try {
        const mutation = `
          mutation CreateUsers {
            createUsers {
              email
            }
          }
        `
        tester.mock(mutation, {
          email: 'test@test.com',
          username: 'test',
          fullName: 'test',
          password: 'test'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('The input value on createUsers must be an array')
    })

    it('Should throw an error if the input is an array and it must be an obj', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser {
            createUser {
              email
            }
          }
        `
        tester.mock(mutation, [{
          email: 'test@test.com',
          username: 'test',
          fullName: 'test',
          password: 'test'
        }])
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('The input value on createUser is an array and it must be an object')
    })

    it('Should throw an error if the input is string and it must be a number', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserAge{
            updateUserAge {
              email
            }
          }
        `
        tester.mock(mutation, {
          id: '123',
          age: '10'
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('age argument is not type Int')
    })

    it('Should throw an error if the input is boolean and it must be a number', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserAge{
            updateUserAge {
              email
            }
          }
        `
        tester.mock(mutation, {
          id: '123',
          age: true
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('age argument is not type Int')
    })

    it('Should throw an error if the input is an array and it must be an array', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores{
            updateUserScores {
              scores
            }
          }
        `
        tester.mock(mutation, {
          scores: 1
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('scores must be an Array on updateUserScores')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields on CreateUser', () => {
      const mutation = `
        mutation CreateUser{
          createUser {
            email
          }
        }
      `
      const test = tester.mock(mutation, {
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })

    it('Should return selected fields on CreateUsers', () => {
      const mutation = `
        mutation CreateUsers{
          createUsers {
            email
            username
            fullName
          }
        }
      `
      const test = tester.mock(mutation, [{
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      }])

      expect(test).to.exist
      expect(test).to.be.a('array')
      expect(test.length).to.be.gt(0)
      expect(test[0].email).to.be.a('string')
      expect(test[0].username).to.be.a('string')
      expect(test[0].fullName).to.be.a('string')
    })

    it('Should return selected fields on UpdateUserAge', () => {
      const mutation = `
        mutation UpdateUserAge{
          updateUserAge {
            email
          }
        }
      `
      const test = tester.mock(mutation, {
        id: '123',
        age: 10
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
        mutation IsAdmin{
          isAdmin {
            email
          }
        }
      `
      const test = tester.mock(mutation, {
        isAdmin: true
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
          mutation UpdateUserScores{
            updateUserScores {
              email
              scores
            }
          }
        `
      const test = tester.mock(mutation, {
        scores: [1]
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })
  })
})
