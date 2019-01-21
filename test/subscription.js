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

describe('Subscription', () => {
  describe('Mock subscription', () => {
    let tester

    before(() => {
      tester = new EasyGraphQLTester([userSchema, familySchema])
    })

    it('Should mock a subscription', () => {
      const subscription = `
        subscription {
          newUsers(limit: 1) {
            id
            username
            email
          } 
        }
      `

      const { newUsers } = tester.mock(subscription)

      expect(newUsers).to.be.an('array')
      expect(newUsers[0].id).to.be.a('string')
      expect(newUsers[0].username).to.be.a('string')
      expect(newUsers[0].email).to.be.a('string')
    })

    it('Should mock a subscription with object variables', () => {
      const subscription = `
        subscription ($isAdmin: Boolean!) {
          createdUser (where: {
            isAdmin: isAdmin
          }){
            id
            username
          }
        }
      `

      const { createdUser } = tester.mock(subscription)

      expect(createdUser).to.exist
      expect(createdUser.id).to.be.a('string')
      expect(createdUser.username).to.be.a('string')
    })

    it('Should set fixture to a subscription', () => {
      const subscription = `
        subscription {
          newUser {
            id
            username
            email
          } 
        }
      `

      const fixture = {
        newUser: {
          id: '1',
          username: 'easygraphql'
        }
      }

      const { newUser } = tester.mock({
        query: subscription,
        fixture,
        saveFixture: true
      })

      expect(newUser).to.be.exist
      expect(newUser.id).to.be.a('string')
      expect(newUser.id).to.be.eq('1')
      expect(newUser.username).to.be.a('string')
      expect(newUser.username).to.be.eq('easygraphql')
      expect(newUser.email).to.be.a('string')
    })

    it('Should return saved fixture', () => {
      const subscription = `
        subscription {
          newUser {
            id
            username
            email
          } 
        }
      `

      const { newUser } = tester.mock(subscription)

      expect(newUser).to.be.exist
      expect(newUser.id).to.be.a('string')
      expect(newUser.id).to.be.eq('1')
      expect(newUser.username).to.be.a('string')
      expect(newUser.username).to.be.eq('easygraphql')
      expect(newUser.email).to.be.a('string')
    })

    it('Should return an error if a field is invaild on a subscription', () => {
      let error
      try {
        const invalidSubscription = `
          subscription {
            newUser {
              invalidField
              username
              email
            } 
          }
        `

        tester.mock(invalidSubscription)
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq("Subscription newUser: The selected field invalidField doesn't exists")
    })

    it('Should return an error if an argument is invaild on a subscription', () => {
      let error
      try {
        const invalidSubscription = `
          subscription {
            newUsers(limit: 1, invalidArg: true) {
              id
              username
              email
            } 
          }
        `

        tester.mock(invalidSubscription)
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('invalidArg argument is not defined on newUsers arguments')
    })

    it('Should return an error if an argument type is invaild on a subscription', () => {
      let error
      try {
        const invalidSubscription = `
          subscription {
            newUsers(limit: true) {
              id
              username
              email
            } 
          }
        `

        tester.mock(invalidSubscription)
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('limit argument is not type Int')
    })
  })

  describe('Should support custom names for root types', () => {
    let tester

    before(() => {
      tester = new EasyGraphQLTester(customRootTypeNamesSchema)
    })

    it('Should support a custom name for the root subscription type', () => {
      const subscription = `
        subscription {
          newPost {
            content
          }
        }
      `

      const { newPost } = tester.mock(subscription)
      expect(newPost).to.exist
      expect(newPost.content).to.be.a('string')
    })

    it('Should support mock with graphql-tag', () => {
      const subscription = gql`
        subscription {
          newPost {
            content
          }
        }
      `

      const { newPost } = tester.mock(subscription)
      expect(newPost).to.exist
      expect(newPost.content).to.be.a('string')
    })
  })
})
