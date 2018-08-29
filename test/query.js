/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

describe('Query', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(schemaCode)
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
        tester.test(query)
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
        tester.test(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Invalid field invalidField on getMe')
    })

    it('Should throw an error with the invalid field', () => {
      let error
      try {
        const query = `
          {
            getMe {
              id
              familyInfo {
                father {
                  id
                  email
                  username
                }
              }
            }
          }
        `
        tester.test(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Invalid field id on getMe')
    })

    it('Should throw an error with the invalid field', () => {
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
        tester.test(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('getMe: Must select field on familyInfo')
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
        tester.test(query)
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
            getUserByUsername(email: test) {
              email
            }
          }
        `
        tester.test(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is missing on getUserByUsername')
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
        tester.test(query)
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
        tester.test(query)
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
        tester.test(query)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('username argument is not type String')
    })

    it('Should ignore extra arguments', () => {
      const query = `
        {
          getUserByUsername(username: test, name: test) {
            email
          }
        }
      `
      const test = tester.test(query)
      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields', () => {
      const query = `
        {
          getMe {
            id
            email
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
          }
        }
      `

      const test = tester.test(query)
      expect(test).to.exist
      expect(test.id).to.exist
      expect(test.id).to.be.a('string')
      expect(test.email).to.exist
      expect(test.email).to.be.a('string')
      expect(test.familyInfo).to.exist
      expect(test.familyInfo).to.be.a('array')
      expect(test.familyInfo[0].father).to.exist
      expect(test.familyInfo[0].father.email).to.exist
      expect(test.familyInfo[0].father.email).to.be.a('string')
      expect(test.familyInfo[0].mother).to.exist
      expect(test.familyInfo[0].mother.username).to.exist
      expect(test.familyInfo[0].mother.username).to.be.a('string')
      expect(test.familyInfo[0].brothers).to.exist
      expect(test.familyInfo[0].brothers).to.be.a('array')
      expect(test.familyInfo[0].brothers[0].fullName).to.be.a('string')
    })
  })
})
