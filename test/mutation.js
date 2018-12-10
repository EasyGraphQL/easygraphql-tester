/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

describe('Mutation', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester([userSchema, familySchema])
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
              invalidField
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
      expect(error.message).to.be.eq(`Mutation createUser: The selected field invalidField doesn't exists`)
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

    it('Should throw an error if the input value is invalid', () => {
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
          invalidField: 1
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('invalidField argument is not defined on updateUserScores Input')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields on CreateUser', () => {
      const mutation = `
        mutation CreateUser($input: UserInput!){
          createUser(input: $input) {
            email
          }
        }
      `
      const { createUser } = tester.mock(mutation, {
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      })

      expect(createUser).to.exist
      expect(createUser.email).to.be.a('string')
    })

    it('Should return selected fields on CreateUsers', () => {
      const mutation = `
        mutation CreateUsers($input: [UserInput]!){
          createUsers(input: $input) {
            email
            username
            fullName
          }
        }
      `
      const { createUsers } = tester.mock(mutation, [{
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      }])

      expect(createUsers).to.exist
      expect(createUsers).to.be.a('array')
      expect(createUsers.length).to.be.gt(0)
      expect(createUsers[0].email).to.be.a('string')
      expect(createUsers[0].username).to.be.a('string')
      expect(createUsers[0].fullName).to.be.a('string')
    })

    it('Should return selected fields on UpdateUserAge', () => {
      const mutation = `
        mutation UpdateUserAge($input: UpdateUserAgeInput!){
          updateUserAge(input: $input) {
            email
          }
        }
      `
      const { updateUserAge } = tester.mock(mutation, {
        id: '123',
        age: 10
      })

      expect(updateUserAge).to.exist
      expect(updateUserAge.email).to.be.a('string')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
        mutation IsAdmin($input: IsAdminInput!){
          isAdmin(input: $input) {
            email
          }
        }
      `
      const { isAdmin } = tester.mock(mutation, {
        isAdmin: true
      })

      expect(isAdmin).to.exist
      expect(isAdmin.email).to.be.a('string')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(input: $input) {
              email
              scores
            }
          }
        `
      const { updateUserScores } = tester.mock(mutation, {
        scores: [1]
      })

      expect(updateUserScores).to.exist
      expect(updateUserScores.email).to.be.a('string')
    })

    it('Should set fixtures and save it', () => {
      const mutation = `
        mutation UpdateUserScores($input: UpdateUserScoresInput!){
          updateUserScores(input: $input) {
            email
            scores
          }
        }
      `

      const fixture = {
        email: 'demo@demo.com',
        scores: [1]
      }

      const { updateUserScores } = tester.mock({
        query: mutation,
        variables: { scores: [1] },
        fixture,
        saveFixture: true
      })

      expect(updateUserScores).to.exist
      expect(updateUserScores.email).to.be.a('string')
      expect(updateUserScores.email).to.be.eq('demo@demo.com')

      const mock = tester.mock({
        query: mutation,
        variables: { scores: [1] }
      })

      expect(mock.updateUserScores).to.exist
      expect(mock.updateUserScores.email).to.be.a('string')
      expect(mock.updateUserScores.email).to.be.eq('demo@demo.com')
      expect(mock.updateUserScores.scores[0]).to.be.eq(1)
    })

    it('Should fail if the fixture has extra data', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(input: $input) {
              email
              scores
            }
          }
        `

        const fixture = {
          email: 'demo@demo.com',
          name: 'easygraphql'
        }

        tester.mock({
          query: mutation,
          variables: { scores: [1] },
          fixture,
          saveFixture: true
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq(`name is not called on the query, and it's on the fixture.`)
    })

    it('Should fail if the fixture has to be an array', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(input: $input) {
              email
              scores
            }
          }
        `

        const fixture = {
          email: 'demo@demo.com',
          scores: 1
        }

        tester.mock({
          query: mutation,
          variables: { scores: [1] },
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('scores is not an array and it should be one.')
    })

    it('Should fail if the fixture has a different data type', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(input: $input) {
              email
              scores
            }
          }
        `

        const fixture = {
          email: true
        }

        tester.mock({
          query: mutation,
          variables: { scores: [1] },
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('email is not the same type as the document.')
    })
  })
})
