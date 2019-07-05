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
    const resolver = {
      Mutation: {
        updateUserAge: (__, args, ctx) => {
          const { id, age } = args.input

          return { id, age }
        }
      }
    }
    tester = new EasyGraphQLTester([userSchema, familySchema], resolver)
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { email: "test@test.com", fullName: "test", password: "test" }; Field value.username of required type String! was not provided.')
    })
  })

  describe('Should throw an error if a field is invalid', () => {
    it('Should throw an error with a missing field', () => {
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { email: "test@test.com", username: "test", fullName: "test", password: "test" }; Field value.dob of required type DateTime! was not provided.')
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { email: "test@test.com", username: 1, fullName: "test", password: "test" }; Expected type String at value.username. String cannot represent a non string value: 1')
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { email: "test@test.com", username: true, fullName: "test", password: "test" }; Expected type String at value.username. String cannot represent a non string value: true')
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
            password: 'test',
            dob: '10-10-2001'
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variable "$input" of type "UserInput!" used in position expecting type "[UserInput]!".')
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
            password: 'test',
            dob: '10-10-2001'
          }]
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variable "$input" got invalid value [{ email: "test@test.com", username: "test", fullName: "test", password: "test", dob: "10-10-2001" }]; Field value.email of required type String! was not provided.')
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { id: "123", age: "10" }; Expected type Int at value.age. Int cannot represent non-integer value: "10"')
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { id: "123", age: true }; Expected type Int at value.age. Int cannot represent non-integer value: true')
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
      expect(error.message).to.be.eq('Variable "$scores" got invalid value { invalidField: 1 }; Field value.scores of required type [Int]! was not provided.')
    })

    it('should test GraphQL mutation', async () => {
      const mutation = `
        mutation UpdateUserAge($input: UpdateUserAgeInput!) {
          updateUserAge(input: $input) {
            id
            age
          }
        } 
      `

      const args = {
        input: {
          id: '1',
          age: 27
        }
      }
      const { data: { updateUserAge } } = await tester.graphql(mutation, undefined, undefined, args)

      expect(updateUserAge.id).to.be.eq(args.input.id)
      expect(updateUserAge.age).to.be.eq(args.input.age)
    })
  })

  describe('Should return selected fields', () => {
    afterEach(() => {
      tester.clearFixture()
    })

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
          variables: { demo: { scores: [1] } }
        })

        expect(updateUserScores).to.exist
        expect(updateUserScores.email).to.be.a('string')
        expect(updateUserScores.email).to.be.eq('demo@demo.com')
        expect(updateUserScores.scores[0]).to.be.eq(1)
      }
    })

    it('Should set fixture and prevent mocking the fields', () => {
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

      tester.setFixture(fixture, { autoMock: false })

      {
        const { data: { updateUserScores } } = tester.mock({
          query: mutation,
          variables: { demo: { scores: [1] } }
        })

        expect(updateUserScores).to.exist
        expect(updateUserScores.email).to.be.a('string')
        expect(updateUserScores.email).to.be.eq('demo@demo.com')
        expect(updateUserScores.scores).to.be.an('array')
      }
    })

    it('Should fail if autoMock false and missing field on fixture', () => {
      let error
      try {
        const mutation = `
          mutation UpdateUserScores($demo: UpdateUserScoresInput!){
            updateUserScores(scores: $demo) {
              email
              scores
              username
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

        tester.setFixture(fixture, { autoMock: false })

        tester.mock({
          query: mutation,
          variables: { demo: { scores: [1] } }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Cannot return null for non-nullable field Me.username.')
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
        variables: { input: { scores: [1] } },
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

      const { errors } = tester.mock({
        query: mutation,
        variables: { input: { scores: [1] } },
        mockErrors: true
      })

      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "Me".')
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
        fixture,
        mockErrors: true
      })

      expect(data).to.be.null
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors).to.have.length.gte(1)
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
          variables: { input: { scores: [1] } },
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Expected Iterable, but did not find one for field Me.scores.')
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
          variables: { input: { scores: [1] } }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Unknown argument "name" on field "updateUserScores" of type "Mutation".')
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
      expect(error.message).to.be.eq('Argument "scores" of required type "UpdateUserScoresInput!" was not provided.')
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
      expect(error.message).to.be.eq('Variable "$input" got invalid value { isAdmin: [true] }; Expected type Boolean at value.isAdmin. Boolean cannot represent a non boolean value: [true]')
    })
  })

  describe('Should support custom names for root types', () => {
    let tester

    before(() => {
      tester = new EasyGraphQLTester(customRootTypeNamesSchema)
    })

    it('Should support a custom name for the root mutation type', () => {
      const mutation = `
        mutation addPost($content: PostInput!) {
          appendPost(post: $content) {
            content
          }
        }
      `

      const { data: { appendPost } } = tester.mock({
        query: mutation,
        variables: {
          content: {
            content: 'Hello, world!'
          }
        }
      })
      expect(appendPost).to.exist
      expect(appendPost.content).to.be.a('string')
    })

    it('Should support mock with graphql-tag', () => {
      const mutation = gql`
        mutation addPost($content: PostInput!) {
          appendPost(post: $content) {
            content
          }
        }
      `

      const { data: { appendPost } } = tester.mock({
        query: mutation,
        variables: {
          content: {
            content: 'Hello, world!'
          }
        }
      })
      expect(appendPost).to.exist
      expect(appendPost.content).to.be.a('string')
    })
  })
})
