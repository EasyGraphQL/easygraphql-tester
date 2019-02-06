/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const schema = require('./schema/schema.json')

describe('Query', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(schema)
  })

  it('Should get user info', () => {
    const query = `
      {
        getUser {
          email
        }
      }
    `

    const { data: { getUser } } = tester.mock({
      query,
      mockErrors: true
    })

    expect(getUser).to.exist
    expect(getUser.email).to.to.be.a('string')
  })
})
