/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const EasyGraphQLTester = require('../lib')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')
const tester = new EasyGraphQLTester(schemaCode)


const invalidQuery = `
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
tester.test('Should throw an error, invalidField on query', false, invalidQuery)

const validQuery = `
  {
    getMeByTestResult(result: 4.9) {
      email
    }
  }
`
tester.test('Should pass when email is requested', true, validQuery)