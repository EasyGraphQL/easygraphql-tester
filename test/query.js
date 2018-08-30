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
      expect(error.message).to.be.eq('Invalid field invalidField on getMe')
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
                  id
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
      expect(error.message).to.be.eq('Invalid field id on getMe')
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
      expect(error.message).to.be.eq('getMe: Must select field on familyInfo')
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
      expect(error.message).to.be.eq('getFamilyInfo: Must select field on father')
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
            getUserByUsername(email: test) {
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

    it('Should ignore extra arguments', () => {
      const query = `
        {
          getUserByUsername(username: test, name: test) {
            email
          }
        }
      `
      const test = tester.mock(query)
      expect(test).to.exist
      expect(test.email).to.be.a('string')
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
          }
        }
      `

      const test = tester.mock(query)
      expect(test).to.exist
      expect(test.id).to.exist
      expect(test.id).to.be.a('string')
      expect(test.email).to.exist
      expect(test.email).to.be.a('string')
      expect(test.scores).to.be.a('array')
      expect(test.scores[0]).to.be.a('number')
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
      const test = tester.mock(query)

      expect(test.father.email).to.be.a('string')
    })

    it('Should return selected fields on getMeByAge', () => {
      const query = `
        {
          getMeByAge(age: 27) {
            email
          }
        }
      `
      const test = tester.mock(query)

      expect(test.email).to.be.a('string')
    })

    it('Should return selected fields on getMeByTestResult', () => {
      const query = `
        {
          getMeByTestResult(result: 4.9) {
            email
          }
        }
      `
      const test = tester.mock(query)
      expect(test.email).to.be.a('string')
    })
  })
})
