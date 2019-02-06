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
          query UserQuery {
            ...User
          }

          fragment User on Query {
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
  })

  describe('Should throw an error with invalid arguments', () => {
    it('Should throw an error if email argument is missing', () => {
      let error
      try {
        const query = `
          query UserQuery($username: String!) {
            ...User
          }

          fragment User on Query {
            getUserByUsername(username: $username) {
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
      expect(error.message).to.be.eq('Argument "name" of required type "String!" was not provided.')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields on GetMe', () => {
      const query = `
        query UserQuery {
          ...User
        }

        fragment User on Query {
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
  })

  describe('Mutation', () => {
    it('Should return selected fields on CreateUser', () => {
      const mutation = gql`
        mutation CreateUser($input: UserInput!){
          ...User
        }

        fragment User on Mutation {
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
  })

  describe('Multiples fragments', () => {
    it('Should return selected fields on CreateUser', () => {
      const multiplesFragments = gql`
        query UserQuery {
          getMe {
            ...me_info
          }
        }

        fragment me_info on Me {
          id
          email
          scores
          familyInfo {
            father {
              ...user_info
            }
            mother {
              ...user_info
            }
          }
        }

        fragment user_info on User {
          email
          username
        }
      `
      const { data: { getMe } } = tester.mock(multiplesFragments)
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
    })
  })
})
