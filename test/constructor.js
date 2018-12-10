/* eslint-env mocha */
/* eslint-disable no-new, no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

describe('Constructor', () => {
  it('Should fail if the schema is missing', () => {
    let error
    try {
      new EasyGraphQLTester()
    } catch (err) {
      error = err
    }

    expect(error).to.be.an.instanceOf(Error)
    expect(error.message).to.be.eq('The schema is require')
  })

  it('Should fail if the schema is null', () => {
    let error
    try {
      new EasyGraphQLTester(null)
    } catch (err) {
      error = err
    }

    expect(error).to.be.an.instanceOf(Error)
    expect(error.message).to.be.eq('The schema is require')
  })

  it('Should initialize constructor', () => {
    const tester = new EasyGraphQLTester([userSchema, familySchema])

    expect(tester).to.exist
  })

  it('Should fail if the there is no query to test', () => {
    const tester = new EasyGraphQLTester([userSchema, familySchema])
    let error
    try {
      tester.mock()
    } catch (err) {
      error = err
    }

    expect(error).to.be.an.instanceOf(Error)
    expect(error.message).to.be.eq('The Query/Mutation to test is require')
  })

  it('Should fail if the there is no query to test on the opts', () => {
    const tester = new EasyGraphQLTester([userSchema, familySchema])
    let error
    try {
      tester.mock({})
    } catch (err) {
      error = err
    }

    expect(error).to.be.an.instanceOf(Error)
    expect(error.message).to.be.eq('The Query/Mutation to test is require')
  })
})
