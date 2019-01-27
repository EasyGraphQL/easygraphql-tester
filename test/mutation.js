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
const customRootTypeNamesSchema = fs.readFileSync(path.join(__dirname, 'schema', 'customRootTypeNames.gql'), 'utf8')

describe('Mutation', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester([userSchema, familySchema])
  })

  describe('Should throw an error if variables are missing', () => {
    it('Should throw an error if the variables are not complete', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            email: 'test@test.com',
            fullName: 'test',
            password: 'test'
          }
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
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              invalidField
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            email: 'test@test.com',
            username: 'test',
            fullName: 'test',
            password: 'test'
          }
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
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            email: 'test@test.com',
            username: 1,
            fullName: 'test',
            password: 'test'
          }
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
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            email: 'test@test.com',
            username: true,
            fullName: 'test',
            password: 'test'
          }
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
          mutation CreateUsers($input: UserInput!) {
            createUsers(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            email: 'test@test.com',
            username: 'test',
            fullName: 'test',
            password: 'test'
          }
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
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: [{
            email: 'test@test.com',
            username: 'test',
            fullName: 'test',
            password: 'test'
          }]
        })
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
          mutation UpdateUserAge($input: UpdateUserAgeInput!) {
            updateUserAge(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            id: '123',
            age: '10'
          }
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
          mutation UpdateUserAge($input: UpdateUserAgeInput!) {
            updateUserAge(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            id: '123',
            age: true
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('age argument is not type Int')
    })

    it('Should throw an error if the input is not an array and it must be an array', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($scores: UpdateUserScoresInput!){
            updateUserScores(scores: $scores) {
              scores
            }
          }
        `
        tester.mock(mutation, {
          scores: {
            scores: 1
          }
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
          mutation UpdateUserScores($scores: UpdateUserScoresInput!){
            updateUserScores(scores: $scores) {
              scores
            }
          }
        `
        tester.mock(mutation, {
          scores: {
            invalidField: 1
          }
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
      const { data: { createUser } } = tester.mock(mutation, {
        input: {
          email: 'test@test.com',
          username: 'test',
          fullName: 'test',
          password: 'test',
          dob: '10-10-1999'
        }
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
      const { data: { createUsers } } = tester.mock(mutation, {
        input: [{
          email: 'test@test.com',
          username: 'test',
          fullName: 'test',
          password: 'test',
          dob: '10-10-1999'
        }]
      })

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
      const { data: { updateUserAge } } = tester.mock(mutation, {
        input: {
          id: '123',
          age: 10
        }
      })

      expect(updateUserAge).to.exist
      expect(updateUserAge.email).to.be.a('string')
    })

    it('Should return a Boolean', () => {
      const mutation = `
        mutation CreateBoolean($input: IsAdminInput!) {
          createBoolean(input: $input)
        }
      `

      const { data: { createBoolean } } = tester.mock(mutation, {
        input: {
          isAdmin: true
        }
      })

      expect(createBoolean).to.exist
      expect(createBoolean).to.be.a('boolean')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
        mutation IsAdmin($input: IsAdminInput!){
          isAdmin(input: $input) {
            email
          }
        }
      `
      const { data: { isAdmin } } = tester.mock(mutation, {
        input: {
          isAdmin: true
        }
      })

      expect(isAdmin).to.exist
      expect(isAdmin.email).to.be.a('string')
    })

    it('Should return selected fields on IsAdmin', () => {
      const mutation = `
          mutation UpdateUserScores($scores: UpdateUserScoresInput!){
            updateUserScores(scores: $scores) {
              email
              scores
            }
          }
        `
      const { data: { updateUserScores } } = tester.mock(mutation, {
        scores: {
          scores: [1]
        }
      })

      expect(updateUserScores).to.exist
      expect(updateUserScores.email).to.be.a('string')
    })

    it('Should return selected fields on createNewUser', () => {
      const mutation = `
          mutation CreateNewUser($demo: UserInput!){
            createNewUser(input: [$demo]) {
              email
            }
          }
        `
      const { data: { createNewUser } } = tester.mock(mutation, {
        demo: [{
          email: 'demo',
          username: 'demo',
          fullName: 'demo',
          password: 'demo',
          dob: '10-10-1999'
        }]
      })

      expect(createNewUser).to.exist
      expect(createNewUser.email).to.be.a('string')
    })

    it('Should set fixtures and save it', () => {
      const mutation = `
        mutation UpdateUserScores($demo: UpdateUserScoresInput!){
          updateUserScores(scores: $demo) {
            email
            scores
          }
        }
      `

      const fixture = {
        data: {
          updateUserScores: {
            email: 'demo@demo.com',
            scores: [1]
          }
        }
      }

      {
        const { data: { updateUserScores } } = tester.mock({
          query: mutation,
          variables: { demo: { scores: [1] } },
          fixture,
          saveFixture: true
        })

        expect(updateUserScores).to.exist
        expect(updateUserScores.email).to.be.a('string')
        expect(updateUserScores.email).to.be.eq('demo@demo.com')
      }

      {
        const { data: { updateUserScores } } = tester.mock({
          query: mutation,
          variables: { scores: { scores: [1] } }
        })

        expect(updateUserScores).to.exist
        expect(updateUserScores.email).to.be.a('string')
        expect(updateUserScores.email).to.be.eq('demo@demo.com')
        expect(updateUserScores.scores[0]).to.be.eq(1)
      }
    })

    it('Should ignore extra data on the fixture', () => {
      const mutation = `
        mutation UpdateUserScores($input: UpdateUserScoresInput!){
          updateUserScores (scores: $input) {
            email
            scores
          }
        }
      `

      const fixture = {
        data: {
          updateUserScores: {
            email: 'demo@demo.com',
            name: 'easygraphql'
          }
        }
      }

      const { data: { updateUserScores } } = tester.mock({
        query: mutation,
        variables: { scores: { scores: [1] } },
        fixture,
        saveFixture: true
      })

      expect(updateUserScores).to.exist
      expect(updateUserScores.email).to.be.eq('demo@demo.com')
    })

    it('Should return errors object if it is set on the fixture', () => {
      const mutation = `
        mutation UpdateUserScores($input: UpdateUserScoresInput!){
          updateUserScores (scores: $input) {
            email
            scores
            invalidField
          }
        }
      `

      const fixture = {
        errors: [
          {
            'message': 'Cannot query field "invalidField" on type "updateUserScores".',
            'locations': [
              {
                'line': 7,
                'column': 5
              }
            ]
          }
        ]
      }

      const { errors } = tester.mock({
        query: mutation,
        variables: { scores: { scores: [1] } },
        fixture
      })

      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "updateUserScores".')
    })

    it('Should return errors object if it is set on the fixture and data null', () => {
      const mutation = `
        mutation UpdateUserScores($input: UpdateUserScoresInput!){
          updateUserScores (scores: $input) {
            email
            scores
            invalidField
          }
        }
      `

      const fixture = {
        data: null,
        errors: [
          {
            'message': 'Cannot query field "invalidField" on type "updateUserScores".',
            'locations': [
              {
                'line': 7,
                'column': 5
              }
            ]
          }
        ]
      }

      const { data, errors } = tester.mock({
        query: mutation,
        variables: { scores: { scores: [1] } },
        fixture
      })

      expect(data).to.be.null
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "updateUserScores".')
    })

    it('Should fail if the fixture has to be an array', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(scores: $input) {
              email
              scores
            }
          }
        `

        const fixture = {
          data: {
            updateUserScores: {
              email: 'demo@demo.com',
              scores: 1
            }
          }
        }

        tester.mock({
          query: mutation,
          variables: { scores: { scores: [1] } },
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('scores fixture is not an array and it should be one.')
    })

    it('Should fail if the fixture has a different data type', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(scores: $input) {
              email
              scores
            }
          }
        `

        const fixture = {
          data: {
            updateUserScores: {
              email: true
            }
          }
        }

        tester.mock({
          query: mutation,
          variables: { scores: { scores: [1] } },
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('email is not the same type as the document.')
    })

    it('Should fail if the mutations has any extra argument', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($input: UpdateUserScoresInput!){
            updateUserScores(scores: $input, name: "demo") {
              email
              scores
            }
          }
        `

        tester.mock({
          query: mutation,
          variables: { scores: { scores: [1] } }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq("name argument is defined on the mutation and it's missing on the document updateUserScores")
    })

    it('Should fail if the mutations has no argument', () => {
      let error
      try {
        const mutation = `
          mutation {
            updateUserScores {
              email
              scores
            }
          }
        `

        tester.mock({
          query: mutation,
          variables: { scores: { scores: [1] } }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('scores argument is missing on updateUserScores')
    })

    it('Should fail if the mutations has no argument', () => {
      let error
      try {
        const mutation = `
          mutation IsAdmin($input: IsAdminInput!){
            isAdmin(input: $input) {
              email
            }
          }
        `
        tester.mock(mutation, {
          input: {
            isAdmin: [true]
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq("isAdmin is an Array and it shouldn't be one isAdmin")
    })
  })

  describe('Should support custom names for root types', () => {
    let tester

    before(() => {
      tester = new EasyGraphQLTester(customRootTypeNamesSchema)
    })

    it('Should support a custom name for the root mutation type', () => {
      const mutation = `
        mutation addPost($content: String!) {
          appendPost(post: $content) {
            content
          }
        }
      `

      const { data: { appendPost } } = tester.mock(mutation, { post: { content: 'Hello, world!' } })
      expect(appendPost).to.exist
      expect(appendPost.content).to.be.a('string')
    })

    it('Should support mock with graphql-tag', () => {
      const mutation = gql`
        mutation addPost($content: String!) {
          appendPost(post: $content) {
            content
          }
        }
      `

      const { data: { appendPost } } = tester.mock({
        query: mutation,
        variables: {
          post: {
            content: 'Hello, world!'
          }
        }
      })
      expect(appendPost).to.exist
      expect(appendPost.content).to.be.a('string')
    })
  })
})
