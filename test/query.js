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
    tester = new EasyGraphQLTester([userSchema, familySchema])
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
      expect(error.message).to.be.eq('There is no query called getUser on the Schema')
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
      expect(error.message).to.be.eq(`Query getMe: The selected field invalidField doesn't exists`)
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
      expect(error.message).to.be.eq(`Query getMe: The selected field invalidField doesn't exists`)
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
      expect(error.message).to.be.eq('Query getMe: There should be a selected field on familyInfo')
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
      expect(error.message).to.be.eq('Query getFamilyInfo: There should be a selected field on father')
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
      expect(error.message).to.be.eq(`Query getUsers: The selected field invalidName doesn't exists`)
    })
  })

  describe('Should throw an error with invalid arguments', () => {
    it('Should throw an error if email argument is missing', () => {
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
      expect(error.message).to.be.eq('name argument is missing on getUserByUsername')
    })

    it('Should throw an error if username argument is missing', () => {
      let error
      try {
        const query = `
          {
            getUserByUsername(name: test) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is missing on getUserByUsername')
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
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('invalidArg argument is not defined on getUserByUsername arguments')
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
      expect(error.message).to.be.eq('username argument is not type String')
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
      expect(error.message).to.be.eq('username argument is not type String')
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
      expect(error.message).to.be.eq('username argument is not type String')
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
      expect(error.message).to.be.eq('username argument is not type String')
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
      expect(error.message).to.be.eq('isLocal argument is not type Boolean')
    })

    it('Should throw an error if the input is int and it must be a array of int', () => {
      let error
      try {
        const query = `
          {
            getMeByResults(results: 1) {
              email
            }
          }
        `
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('results must be an Array on getMeByResults')
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
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('results variable is not defined on getMeByResults arguments')
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
        tester.mock(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('names variable is not defined on getMeByResults arguments')
    })

    it('Should return selected fields on getUserByUsername', () => {
      const query = `
        {
          getUserByUsername(username: test, name: test) {
            email
          }
        }
      `
      const { getUserByUsername } = tester.mock(query)
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

      const { getMe } = tester.mock(query)
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
      const { getFamilyInfoByIsLocal } = tester.mock(query)

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
      const { getMeByAge } = tester.mock(query)

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
      const { getMeByTestResult } = tester.mock(query)
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

      const { getUsers } = tester.mock(query)
      expect(getUsers).to.exist
      expect(getUsers).to.be.a('array')
      expect(getUsers.length).to.be.gt(0)
      expect(getUsers[0].email).to.be.a('string')
      expect(getUsers[0].username).to.be.a('string')
      expect(getUsers[0].fullName).to.be.a('string')
    })

    it('Should return selected fields on GetUsers with fixtures', () => {
      const query = `
        {
          getUsers {
            email
            username
          }
        }
      `

      const fixture = [
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

      const { getUsers } = tester.mock({
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

      const { getUsers } = tester.mock({
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

      const { getMe } = tester.mock({
        query,
        fixture: {
          createdAt: '2018-12-27'
        }
      })

      expect(getMe.createdAt).to.exist
      expect(getMe.createdAt).to.be.a('string')
      expect(getMe.createdAt).to.be.eq('2018-12-27')
      for (const familyInfo of getMe.familyInfo) {
        expect(familyInfo.isLocal).to.be.a('boolean')
      }
    })
  })

  describe('Should support unions', () => {
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
      expect(error.message).to.be.eq('Query search: There should be a selected field on father')
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
      expect(error.message).to.be.eq('There is no type InvalidType on the Schema')
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

      const { search } = tester.mock(query)
      expect(search).to.exist
      expect(search).to.be.a('array')
      expect(search[0].id).to.be.a('string')
    })

    it('Should return selected data', () => {
      const query = `
        query GetMeByResults($results: Int!) {
          getMeByResults(results: $results){
            email
          }
        }
      `

      const { getMeByResults } = tester.mock(query)
      expect(getMeByResults).to.exist
      expect(getMeByResults.email).to.be.a('string')
    })

    it('Should return a string', () => {
      const query = `
        {
          getString
        }
      `

      const { getString } = tester.mock(query)
      expect(getString).to.exist
      expect(getString).to.be.a('string')
    })

    it('Should pass if it returns a Int', () => {
      const query = `
        {
          getInt
        }
      `

      const { getInt } = tester.mock(query)
      expect(getInt).to.exist
      expect(getInt).to.be.a('number')
    })

    it('Should return selected data with query variables', () => {
      const query = `
        query getUserByUsername($username: String!, $name: String!) {
          getUserByUsername(username: $username, name: $name){
            email
          }
        }
      `

      const { getUserByUsername } = tester.mock(query)
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

      const { aliasTest } = tester.mock(query)
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
        email: 'demo@demo.com'
      }

      const { aliasTest } = tester.mock({
        query: query,
        fixture
      })
      expect(aliasTest).to.exist
      expect(aliasTest.email).to.be.a('string')
      expect(aliasTest.email).to.be.eq(fixture.email)

      const mock = tester.mock({
        query: query
      })
      expect(mock.aliasTest).to.exist
      expect(mock.aliasTest.email).to.be.a('string')
      expect(mock.aliasTest.email).not.to.be.eq(fixture.email)
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
                username
              }
            }
          }
        }
      `
      const fixture = {
        email: 'demo@demo.com',
        user: {
          email: 'newemail@demo.com'
        },
        familyInfo: [{
          isLocal: true,
          father: {
            email: 'father@demo.com'
          }
        },
        {
          id: '1',
          isLocal: false,
          father: {
            id: '100'
          }
        }]
      }

      const { getMe } = tester.mock({
        query: query,
        fixture
      })
      expect(getMe).to.exist
      expect(getMe.email).to.be.a('string')
      expect(getMe.email).to.be.eq(fixture.email)
      expect(getMe.user.email).to.be.eq(fixture.user.email)
      expect(getMe.familyInfo).to.be.a('array')
      expect(getMe.familyInfo).to.have.length(2)

      expect(getMe.familyInfo[0].isLocal).to.be.true
      expect(getMe.familyInfo[0].id).to.be.a('string')
      expect(getMe.familyInfo[0].id).not.to.be.eq('1')
      expect(getMe.familyInfo[0].father.email).to.be.eq('father@demo.com')
      expect(getMe.familyInfo[0].father.username).to.be.a('string')
      expect(getMe.familyInfo[0].father.id).to.be.a('string')
      expect(getMe.familyInfo[0].father.id).not.to.be.eq('100')

      expect(getMe.familyInfo[1].isLocal).to.be.false
      expect(getMe.familyInfo[1].id).to.be.a('string')
      expect(getMe.familyInfo[1].id).to.be.eq('1')
      expect(getMe.familyInfo[1].father.email).not.to.be.eq('father@demo.com')
      expect(getMe.familyInfo[1].father.username).to.be.a('string')
      expect(getMe.familyInfo[1].father.id).to.be.a('string')
      expect(getMe.familyInfo[1].father.id).to.be.eq('100')
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

      const { posts } = tester.mock(query)
      expect(posts).to.exist
      expect(posts).to.be.a('array')
      expect(posts.length).to.be.gt(0)
      expect(posts[0].content).to.be.a('string')
    })

    it('Should support a custom name for the root mutation type', () => {
      const mutation = `
        mutation addPost($content: String!) {
          appendPost(post: $content) {
            content
          }
        }
      `

      const { appendPost } = tester.mock(mutation, { post: { content: 'Hello, world!' } })
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

      const { appendPost } = tester.mock({
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
