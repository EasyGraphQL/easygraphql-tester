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

    afterEach(() => {
      tester.clearFixture()
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

      const { data: { newUsers } } = tester.mock(subscription)

      expect(newUsers).to.be.an('array')
      expect(newUsers[0].id).to.be.a('string')
      expect(newUsers[0].username).to.be.a('string')
      expect(newUsers[0].email).to.be.a('string')
    })

    it('Should mock a subscription with object variables', () => {
      const subscription = `
        subscription ($isAdmin: Boolean!) {
          createdUser (where: {
            isAdmin: $isAdmin
          }){
            id
            username
          }
        }
      `

      const { data: { createdUser } } = tester.mock({
        query: subscription,
        variables: {
          isAdmin: true
        }
      })

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
        data: {
          newUser: {
            id: '1',
            username: 'easygraphql'
          }
        }
      }

      const { data: { newUser } } = tester.mock({
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

    it('Should return errors if it is set mockErrors true', () => {
      const subscription = `
        subscription {
          newUser {
            id
            username
            email
            invalidField
          }
        }
      `

      const { errors } = tester.mock({
        query: subscription,
        mockErrors: true
      })

      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "User".')
    })

    it('Should errors if it is set on the fixture and data null', () => {
      const subscription = `
        subscription {
          newUser {
            id
            username
            email
            invalidField
          }
        }
      `

      const fixture = {
        data: null,
        errors: [
          {
            'message': 'Cannot query field "invalidField" on type "newUser".',
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
        query: subscription,
        fixture,
        mockErrors: true
      })

      expect(data).to.be.null
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "newUser".')
    })

    it('Should set fixture using setFixture method and autoMock false', () => {
      const subscription = `
        subscription {
          newUser {
            id
            username
          }
        }
      `

      const fixture = {
        data: {
          newUser: {
            id: '123',
            username: 'easygraphql'
          }
        },
        errors: [
          {
            'message': 'Cannot query field "invalidField" on type "newUser".',
            'locations': [
              {
                'line': 7,
                'column': 5
              }
            ]
          }
        ]
      }

      tester.setFixture(fixture, { autoMock: false })
      const { data: { newUser }, errors } = tester.mock({
        query: subscription,
        mockErrors: true
      })

      expect(newUser).to.exist
      expect(newUser.id).to.be.eq('123')
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Cannot query field "invalidField" on type "newUser".')
    })

    it('Should fail if autoMock false and a field is missing on fixture', () => {
      let error
      try {
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
          data: {
            newUser: {
              id: '123',
              username: 'easygraphql'
            }
          },
          errors: [
            {
              'message': 'Cannot query field "invalidField" on type "newUser".',
              'locations': [
                {
                  'line': 7,
                  'column': 5
                }
              ]
            }
          ]
        }

        tester.setFixture(fixture, { autoMock: false })
        tester.mock({
          query: subscription
        })
      } catch (err) {
        error = err
      }

      expect(error).to.exist
      expect(error.message).to.be.eq('Cannot return null for non-nullable field User.email.')
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

      const { data: { newUser } } = tester.mock(subscription)

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
      expect(error.message).to.be.eq('Cannot query field "invalidField" on type "User".')
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
      expect(error.message).to.be.eq('Unknown argument "invalidArg" on field "newUsers" of type "Subscription".')
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
      expect(error.message).to.be.eq('Argument "limit" has invalid value true.')
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
      const { data: { newPost } } = tester.mock(subscription)
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
      const { data: { newPost } } = tester.mock(subscription)
      expect(newPost).to.exist
      expect(newPost.content).to.be.a('string')
    })
  })
})
