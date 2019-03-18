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

describe('Query', () => {
  let tester

  before(() => {
    const resolvers = {
      Query: {
        getMe: (root, args, ctx) => {
          return {
            id: '1',
            email: 'demo@demo.com',
            username: 'demo'
          }
        }
      }
    }
    tester = new EasyGraphQLTester([userSchema, familySchema], resolvers)
  })

  describe('Should throw an error if a field is missing', () => {
    it('Should throw an error if the operation name is invalid', () => {
      let error
      try {
        const query = `
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
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Cannot query field "getUser" on type "Query". Did you mean "getUsers" or "getMe"?')
    })

    it('Should throw an error with the invalid field', () => {
      let error
      try {
        const query = `
          {
            getMe {
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
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Cannot query field "invalidField" on type "Me".')
    })

    it('Should throw an error with the invalid field on getMe -> father', () => {
      let error
      try {
        const query = `
          {
            getMe {
              id
              familyInfo {
                father {
                  invalidField
                  email
                  username
                }
              }
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Cannot query field "invalidField" on type "User".')
    })

    it('Should throw an error with the invalid field on getMe', () => {
      let error
      try {
        const query = `
          {
            getMe {
              id
              familyInfo
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Field "familyInfo" of type "[FamilyInfo]!" must have a selection of subfields. Did you mean "familyInfo { ... }"?')
    })

    it('Should throw an error with the invalid field on getFamilyInfo', () => {
      let error
      try {
        const query = `
          {
            getFamilyInfo {
              father
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Field "father" of type "User!" must have a selection of subfields. Did you mean "father { ... }"?')
    })

    it('Should fail if there is an invalid field on the query', () => {
      let error
      try {
        const query = `
          {
            getUsers {
              email
              username
              invalidName
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Cannot query field "invalidName" on type "User".')
    })
  })

  describe('Should throw an error with invalid arguments', () => {
    it('Should throw an error if there is an invalid argument', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(username: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" has invalid value test.')
    })

    it('Should throw an error if argument is invalid', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(invalidArg: test) {
              email
            }
          }
        `
        tester.mock({
          query,
          variables: {
            username: 'easygraphql'
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" of required type "String!" was not provided.')
    })

    it('Should throw an error if argument type is invalid. Int', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(username: 1, name: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" has invalid value 1.')
    })

    it('Should throw an error if argument type is invalid, Float', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(username: 0.1, name: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" has invalid value 0.1.')
    })

    it('Should throw an error if argument type is invalid, Boolean', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(username: 1, name: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" has invalid value 1.')
    })

    it('Should throw an error if the input is boolean and it must be a string', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(username: true, name: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "username" has invalid value true.')
    })

    it('Should throw an error if the input is string and it must be a boolean', () => {
      let error
      try {
        const query = `
          {
            getFamilyInfoByIsLocal(isLocal: yes) {
              father {
                email
              }
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "isLocal" has invalid value yes.')
    })

    it('Should throw an error if the input variable is not used', () => {
      let error
      try {
        const query = `
          query GetMeByResults($results: Int!) {
            getMeByResults(results: $invalidVar){
              email
            }
          }
        `
        tester.mock({
          query,
          variables: {
            results: 1
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Argument "results" of required type "[Int]!" was provided the variable "$invalidVar" which was not provided a runtime value.')
    })

    it('Should throw an error if there is an extra input variable', () => {
      let error
      try {
        const query = `
          query GetMeByResults($results: Int!, $names: [String]!) {
            getMeByResults(results: $results){
              email
            }
          }
        `
        tester.mock({
          query,
          variables: {
            results: 1,
            names: ['easygraphql']
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variable "$names" is never used in operation "GetMeByResults".')
    })

    it('Should throw an pass if the input is int and the arg is an array of int', () => {
      const query = `
        {
          getMeByResults(results: 1) {
            email
          }
        }
      `
      const { data: { getMeByResults } } = tester.mock(query)
      expect(getMeByResults).to.exist
      expect(getMeByResults.email).to.be.a('string')
    })

    it('Should return selected fields on getUserByUsername', () => {
      const query = `
        {
          getUserByUsername(username: "test", name: "test") {
            email
          }
        }
      `
      const { data: { getUserByUsername } } = tester.mock(query)
      expect(getUserByUsername).to.exist
      expect(getUserByUsername.email).to.be.a('string')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields on GetMe', () => {
      const query = `
        {
          getMe {
            id
            email
            scores
            familyInfo {
              father {
                email
              }
              mother {
                username
              }
              brothers {
                fullName
              }
            }
            familyRelation
          }
        }
      `

      const { data: { getMe } } = tester.mock(query)
      expect(getMe).to.exist
      expect(getMe.id).to.exist
      expect(getMe.id).to.be.a('string')
      expect(getMe.email).to.exist
      expect(getMe.email).to.be.a('string')
      expect(getMe.scores).to.be.a('array')
      expect(getMe.scores[0]).to.be.a('number')
      expect(getMe.familyInfo).to.exist
      expect(getMe.familyInfo).to.be.a('array')
      expect(getMe.familyInfo[0].father).to.exist
      expect(getMe.familyInfo[0].father.email).to.exist
      expect(getMe.familyInfo[0].father.email).to.be.a('string')
      expect(getMe.familyInfo[0].mother).to.exist
      expect(getMe.familyInfo[0].mother.username).to.exist
      expect(getMe.familyInfo[0].mother.username).to.be.a('string')
      expect(getMe.familyInfo[0].brothers).to.exist
      expect(getMe.familyInfo[0].brothers).to.be.a('array')
      expect(getMe.familyInfo[0].brothers[0].fullName).to.be.a('string')
      expect(['Father', 'Mother', 'Brother']).to.include(getMe.familyRelation)
    })

    it('Should return selected fields on getFamilyInfoByIsLocal', () => {
      const query = `
        {
          getFamilyInfoByIsLocal(isLocal: true) {
            father {
              email
            }
          }
        }
      `
      const { data: { getFamilyInfoByIsLocal } } = tester.mock(query)

      expect(getFamilyInfoByIsLocal.father.email).to.be.a('string')
    })

    it('Should return selected fields on getMeByAge', () => {
      const query = `
        {
          getMeByAge(age: 27) {
            email
          }
        }
      `
      const { data: { getMeByAge } } = tester.mock(query)

      expect(getMeByAge.email).to.be.a('string')
    })

    it('Should return selected fields on getMeByTestResult', () => {
      const query = `
        {
          getMeByTestResult(result: 4.9) {
            email
          }
        }
      `
      const { data: { getMeByTestResult } } = tester.mock(query)
      expect(getMeByTestResult.email).to.be.a('string')
    })

    it('Should return selected fields on GetUsers', () => {
      const query = `
        {
          getUsers {
            email
            username
            fullName
          }
        }
      `

      const { data: { getUsers } } = tester.mock(query)
      expect(getUsers).to.exist
      expect(getUsers).to.be.a('array')
      expect(getUsers.length).to.be.gt(0)
      expect(getUsers[0].email).to.be.a('string')
      expect(getUsers[0].username).to.be.a('string')
      expect(getUsers[0].fullName).to.be.a('string')
    })

    it('Should throw on invalid fixture for arrays', () => {
      {
        let error
        try {
          const query = `
            {
              getUsers {
                email
                username
              }
            }
          `

          const fixture = {
            data: {
              getUsers: 'invalid'
            }
          }

          tester.mock({
            query,
            fixture
          })
        } catch (err) {
          error = err
        }

        expect(error).to.exist
        expect(error.message).to.be.eq('Expected Iterable, but did not find one for field Query.getUsers.')
      }

      {
        let error
        try {
          const query = `
            {
              getUsers {
                email
                username
              }
            }
          `

          const fixture = {
            data: {
              getUsers: ['invalid']
            }
          }

          tester.mock({
            query,
            fixture
          })
        } catch (err) {
          error = err
        }

        expect(error).to.exist
        expect(error.message).to.be.eq('Cannot return null for non-nullable field User.email.')
      }

      {
        let error
        try {
          const query = `
            {
              getMe {
                familyInfo {
                  brothers {
                    username
                  }
                }
              }
            }
          `
          const fixture = {
            data: {
              getMe: {
                familyInfo: [{
                  brothers: [
                    { username: 'brother1' },
                    'invalid'
                  ]
                }]
              }
            }
          }

          tester.mock({
            query,
            fixture
          })
        } catch (err) {
          error = err
        }

        expect(error).to.exist
        expect(error.message).to.be.eq('Cannot return null for non-nullable field User.username.')
      }
    })

    it('Should return selected fields on GetUsers with fixtures', () => {
      const query = `
        {
          getUsers {
            id
            email
            username
          }
        }
      `

      const fixture = {
        data: {
          getUsers: [
            {
              email: 'demo@demo.com',
              username: 'demo'
            },
            {
              email: 'demo1@demo.com',
              username: 'demo1'
            },
            {
              email: 'demo2@demo.com',
              username: 'demo2'
            }
          ]
        }
      }

      const { data: { getUsers } } = tester.mock({
        query,
        fixture,
        saveFixture: true
      })

      expect(getUsers).to.exist
      expect(getUsers).to.be.a('array')
      expect(getUsers.length).to.be.gt(0)
      expect(getUsers.length).to.be.eq(3)
      expect(getUsers[0].email).to.be.eq('demo@demo.com')
      expect(getUsers[0].username).to.be.eq('demo')
      expect(getUsers[1].email).to.be.eq('demo1@demo.com')
      expect(getUsers[1].username).to.be.eq('demo1')
      expect(getUsers[2].email).to.be.eq('demo2@demo.com')
      expect(getUsers[2].username).to.be.eq('demo2')
    })

    it('Should have saved fixtures', () => {
      const query = `
        {
          getUsers {
            email
            username
          }
        }
      `

      const { data: { getUsers } } = tester.mock({
        query
      })

      expect(getUsers).to.exist
      expect(getUsers).to.be.a('array')
      expect(getUsers.length).to.be.gt(0)
      expect(getUsers.length).to.be.eq(3)
      expect(getUsers[0].email).to.be.eq('demo@demo.com')
      expect(getUsers[0].username).to.be.eq('demo')
      expect(getUsers[1].email).to.be.eq('demo1@demo.com')
      expect(getUsers[1].username).to.be.eq('demo1')
      expect(getUsers[2].email).to.be.eq('demo2@demo.com')
      expect(getUsers[2].username).to.be.eq('demo2')
    })

    it('Should return falsy field values in nested positions', () => {
      const query = `
        {
          getMe {
            createdAt
            familyInfo {
              id
              isLocal
            }
          }
        }
      `

      const { data: { getMe } } = tester.mock({
        query,
        fixture: {
          data: {
            getMe: {
              createdAt: '2018-12-27'
            }
          }
        }
      })

      expect(getMe.createdAt).to.exist
      expect(getMe.createdAt).to.be.a('string')
      expect(getMe.createdAt).to.be.eq('2018-12-27')
      for (const familyInfo of getMe.familyInfo) {
        expect(familyInfo.isLocal).to.be.a('boolean')
      }
    })

    it('Should not apply the fixture if the field is not valid', () => {
      const query = `
        {
          getMe {
            email
          }
        }
      `

      const { data: { getMe } } = tester.mock({
        query,
        fixture: {
          data: {
            invalid: {
              email: 'demo@demo.com'
            }
          }
        }
      })

      expect(getMe.email).to.exist
      expect(getMe.email).to.be.a('string')
      expect(getMe.email).not.to.be.eq('demo@demo.com')
    })

    it('Should throw an error if the fixture value is not a boolean', () => {
      let error
      try {
        const query = `
          {
            getMe {
              isAdmin
            }
          }
        `

        tester.mock({
          query,
          fixture: {
            data: {
              getMe: {
                isAdmin: 'true'
              }
            }
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Boolean cannot represent a non boolean value: "true"')
    })

    it('Should throw an error if the fixture value is not a int', () => {
      let error
      try {
        const query = `
          {
            getMe {
              age
            }
          }
        `

        tester.mock({
          query,
          fixture: {
            data: {
              getMe: {
                age: 'age'
              }
            }
          }
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Int cannot represent non-integer value: "age"')
    })

    it('Should return errors mock if it is set on the fixture', () => {
      const query = `
        {
          getUsers {
            email
            username
            invalidField
          }
        }
      `

      const fixture = {
        errors: [
          {
            'message': 'Cannot query field "invalidField" on type "getUsers".',
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
        query,
        fixture,
        mockErrors: true
      })

      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "getUsers".')
    })

    it('Should throw an error if a field is deprecated', () => {
      let error
      try {
        const query = `
          {
            getUsers {
              id
              email
              username
            }
          }
        `

        tester.mock({
          query,
          validateDeprecated: true
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('The field User.id is deprecated. Use `newField`.')
    })

    it('Should throw an error if fixture error is not an array', () => {
      let error
      try {
        const query = `
          {
            getUsers {
              email
              username
            }
          }
        `

        const fixture = {
          errors: {
            'message': 'Cannot query field "invalidField" on type "getUsers".',
            'locations': [
              {
                'line': 7,
                'column': 5
              }
            ]
          }
        }

        tester.mock({
          query,
          fixture
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('The errors fixture should be an array')
    })
  })

  describe('Should support unions', () => {
    beforeEach(() => {
      tester.clearFixture()
    })
    it('Should throw an error with the invalid field on father', () => {
      let error
      try {
        const query = `
          {
            search(id: "1") {
              ... on User {
                id
              }
              ... on FamilyInfo {
                id
                father
                brothers {
                  username
                }
              }
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Field "father" of type "User!" must have a selection of subfields. Did you mean "father { ... }"?')
    })

    it('Should throw an error with there is an invalid type', () => {
      let error
      try {
        const query = `
          {
            search(id: "1") {
              ... on User {
                id
              }
              ... on InvalidType {
                name
              }
              ... on FamilyInfo {
                id
                father
                brothers {
                  username
                }
              }
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Unknown type "InvalidType".')
    })

    it('Should return selected fields on search with union', () => {
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

      const { data: { search } } = tester.mock(query)
      expect(search).to.exist
      expect(search).to.be.a('array')
      expect(search[0].id).to.be.a('string')
    })

    it('Should return selected data', () => {
      const query = `
        query GetMeByResults($results: [Int]!) {
          getMeByResults(results: $results){
            email
          }
        }
      `

      const { data: { getMeByResults } } = tester.mock({
        query,
        variables: {
          results: [1]
        }
      })
      expect(getMeByResults).to.exist
      expect(getMeByResults.email).to.be.a('string')
    })

    it('Should return a string', () => {
      const query = `
        {
          getString
        }
      `

      const { data: { getString } } = tester.mock(query)
      expect(getString).to.exist
      expect(getString).to.be.a('string')
    })

    it('Should return an arr of strings', () => {
      const query = `
        {
          getMultiplesStrings
        }
      `

      const { data: { getMultiplesStrings } } = tester.mock(query)
      expect(getMultiplesStrings).to.exist
      expect(getMultiplesStrings).to.be.an('array')
      expect(getMultiplesStrings.length).to.be.gt(0)
      expect(getMultiplesStrings[0]).to.be.a('string')
    })

    it('Should throw an error if a value inside the array is null', () => {
      let error
      try {
        const query = `
          {
            getMultiplesStrings
          }
        `

        const fixture = {
          data: {
            getMultiplesStrings: ['a', 'b', 'c', null]
          }
        }

        tester.mock({ query, fixture })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Cannot return null for non-nullable field Query.getMultiplesStrings.')
    })

    it('Should pass if it returns a Int', () => {
      const query = `
        {
          getInt
        }
      `

      const fixture = {
        data: {
          getInt: 1
        }
      }

      const { data: { getInt } } = tester.mock({ query, fixture })
      expect(getInt).to.exist
      expect(getInt).to.be.a('number')
    })

    it('Should pass if it returns an arr of Int', () => {
      const query = `
        {
          getMultiplesInt
        }
      `

      const fixture = {
        data: {
          getMultiplesInt: [1, 2, 3]
        }
      }

      const { data: { getMultiplesInt } } = tester.mock({ query, fixture })
      expect(getMultiplesInt).to.exist
      expect(getMultiplesInt).to.be.an('array')
      expect(getMultiplesInt.length).to.be.gt(0)
      expect(getMultiplesInt.length).to.be.eq(3)
      expect(getMultiplesInt[0]).to.be.a('number')
      expect(getMultiplesInt[0]).to.be.eq(1)
    })

    it('Should throw an error if the fixture is null', () => {
      let error
      try {
        const query = `
          {
            getMultiplesInt
          }
        `

        const fixture = {
          data: {
            getMultiplesInt: null
          }
        }

        tester.mock({ query, fixture })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Cannot return null for non-nullable field Query.getMultiplesInt.')
    })

    it('Should set fixtures for scalars', () => {
      const query = `
        {
          getInt
        }
      `

      const fixture = {
        data: {
          getInt: 99
        }
      }

      const { data: { getInt } } = tester.mock({
        query: query,
        fixture
      })
      expect(getInt).to.exist
      expect(getInt).to.be.eq(99)
    })

    it('Should return selected data with query variables', () => {
      const query = `
        query getUserByUsername($username: String!, $name: String!) {
          getUserByUsername(username: $username, name: $name){
            email
          }
        }
      `

      const { data: { getUserByUsername } } = tester.mock({
        query: query,
        variables: {
          username: 'easygraphql',
          name: 'easygraphql'
        }
      })
      expect(getUserByUsername).to.exist
      expect(getUserByUsername.email).to.be.a('string')
    })

    it('Should set the queryName as the alias', () => {
      const query = `
        query getUserByUsername($username: String!, $name: String!) {
          aliasTest: getUserByUsername(username: $username, name: $name){
            email
          }
        }
      `

      const { data: { aliasTest } } = tester.mock({
        query: query,
        variables: {
          username: 'easygraphql',
          name: 'easygraphql'
        }
      })
      expect(aliasTest).to.exist
      expect(aliasTest.email).to.be.a('string')
    })

    it('Should set fixtures but not save it', () => {
      const query = `
        query getUserByUsername($username: String!, $name: String!) {
          aliasTest: getUserByUsername(username: $username, name: $name){
            email
          }
        }
      `
      const fixture = {
        data: {
          getUserByUsername: {
            email: 'demo@demo.com'
          }
        }
      }

      {
        const { data: { aliasTest } } = tester.mock({
          query: query,
          fixture,
          variables: {
            username: 'easygraphql',
            name: 'easygraphql'
          }
        })
        expect(aliasTest).to.exist
        expect(aliasTest.email).to.be.a('string')
        expect(aliasTest.email).to.be.eq(fixture.data.getUserByUsername.email)
      }

      {
        const { data: { aliasTest } } = tester.mock({
          query: query,
          variables: {
            username: 'easygraphql',
            name: 'easygraphql'
          }
        })
        expect(aliasTest).to.exist
        expect(aliasTest.email).to.be.a('string')
        expect(aliasTest.email).not.to.be.eq(fixture.data.getUserByUsername.email)
      }
    })

    it('Should set fixtures on nested objects', () => {
      const query = `
        {
          getMe {
            email
            user {
              email
            }
            familyInfo {
              id
              isLocal
              father {
                id
                email
              }
            }
          }
        }
      `
      const fixture = {
        data: {
          getMe: {
            email: 'demo@demo.com',
            user: {
              email: 'newemail@demo.com'
            },
            familyInfo: [{
              id: '1',
              isLocal: true,
              father: {
                id: '101',
                email: 'father@demo.com'
              }
            },
            {
              id: '2',
              isLocal: false,
              father: {
                id: '101',
                email: 'father@demo.com'
              }
            }]
          }
        }
      }

      const { data: { getMe } } = tester.mock({
        query,
        fixture
      })

      expect(getMe).to.exist
      expect(getMe.email).to.be.a('string')
      expect(getMe.email).to.be.eq(fixture.data.getMe.email)
      expect(getMe.user.email).to.be.eq(fixture.data.getMe.user.email)
      expect(getMe.familyInfo).to.be.a('array')
      expect(getMe.familyInfo).to.have.length(2)

      expect(getMe.familyInfo[0].isLocal).to.be.true
      expect(getMe.familyInfo[0].id).to.be.a('string')
      expect(getMe.familyInfo[0].id).to.be.eq('1')
      expect(getMe.familyInfo[0].father.email).to.be.eq('father@demo.com')
      expect(getMe.familyInfo[0].father.id).to.be.a('string')
      expect(getMe.familyInfo[0].father.id).to.be.eq('101')

      expect(getMe.familyInfo[1].isLocal).to.be.false
      expect(getMe.familyInfo[1].id).to.be.a('string')
      expect(getMe.familyInfo[1].id).to.be.eq('2')
      expect(getMe.familyInfo[1].father.email).to.be.eq('father@demo.com')
      expect(getMe.familyInfo[1].father.id).to.be.a('string')
      expect(getMe.familyInfo[1].father.id).to.be.eq('101')
    })

    it('Should fail if the fixture is missing query field with autoMock false', () => {
      let error
      try {
        const query = `
          {
            getMe {
              email
              user {
                email
              }
              familyInfo {
                id
                isLocal
                father {
                  id
                  email
                  fullName
                }
              }
            }
          }
        `
        const fixture = {
          data: {
            getMe: {
              email: 'demo@demo.com',
              user: {
                email: 'newemail@demo.com'
              },
              familyInfo: [{
                id: '1',
                isLocal: true,
                father: {
                  id: '101',
                  email: 'father@demo.com'
                }
              },
              {
                id: '2',
                isLocal: false,
                father: {
                  id: '101',
                  email: 'father@demo.com'
                }
              }]
            }
          }
        }

        tester.setFixture(fixture, { autoMock: false })

        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Cannot return null for non-nullable field User.fullName.')
    })

    it('Should support multiples queries', () => {
      const query = gql`
        query MULTIPLES_QUERIES {
          aliasTest: getUserByUsername(username: "Username", name: "Full name"){
            email
          }
          getString
          getInt
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

      const { data: { aliasTest, getString, getInt, search } } = tester.mock(query)

      expect(aliasTest).to.exist
      expect(aliasTest.email).to.be.a('string')

      expect(getString).to.exist
      expect(getString).to.be.a('string')

      expect(getInt).to.exist
      expect(getInt).to.be.a('number')

      expect(search).to.exist
      expect(search).to.be.a('array')
      expect(search[0].id).to.be.a('string')
    })

    it('Should pass if the resolver return expected data', async () => {
      const query = `
        {
          getMe {
            id
            email
            username
          }
        }
      `

      const { data: { getMe } } = await tester.graphql(query)

      expect(getMe.id).to.be.eq('1')
      expect(getMe.email).to.be.eq('demo@demo.com')
      expect(getMe.username).to.be.eq('demo')
    })

    it('Should pass if gql is used', async () => {
      const query = gql`
        {
          getMe {
            id
            email
            username
          }
        }
      `

      const { data: { getMe } } = await tester.graphql(query)

      expect(getMe.id).to.be.eq('1')
      expect(getMe.email).to.be.eq('demo@demo.com')
      expect(getMe.username).to.be.eq('demo')
    })
  })

  describe('Should support custom names for root types', () => {
    let tester

    before(() => {
      tester = new EasyGraphQLTester(customRootTypeNamesSchema)
    })

    it('Should support a custom name for the root query type', () => {
      const query = `
        query getPosts {
          posts {
            content
          }
        }
      `

      const { data: { posts } } = tester.mock(query)
      expect(posts).to.exist
      expect(posts).to.be.a('array')
      expect(posts.length).to.be.gt(0)
      expect(posts[0].content).to.be.a('string')
    })

    it('Should support mock with graphql-tag', () => {
      const query = gql`
        query getPosts {
          posts {
            content
          }
        }
      `

      const { data: { posts } } = tester.mock(query)
      expect(posts).to.exist
      expect(posts).to.be.a('array')
      expect(posts.length).to.be.gt(0)
      expect(posts[0].content).to.be.a('string')
    })
  })
})
