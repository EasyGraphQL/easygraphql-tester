'use strict'

const fs = require('fs')
const path = require('path')
const { yesno } = require('yesno-http');
const { expect } = require('chai');
const EasygraphqlTester = require('easygraphql-tester')

const { getMe, getUsers } = require('../src/api-client');
const { getMeQuery, getUsersQuery } = require('../src/queries')


const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.gql'), 'utf8')
const easygraphqlTester = new EasygraphqlTester(schema)

describe('User', () => {
  before(() => {
    yesno.restore()
  })

  beforeEach(() => {
    yesno.restore()
  })

  it('should get GetMe', async () => {
    yesno.mock([
      {
        request: {
          host: 'localhost',
          method: 'POST',
          path: '/',
          port: 3000,
          protocol: 'http',
        },
        response: {
          body: {
            data: {
              getMe: easygraphqlTester.mock(getMeQuery)
            } 
          },
          statusCode: 200,
        },
      }
    ]);
    await getMe();
    const response = yesno.matching(/\//).response()

    expect(response.body.data.getMe).to.be.a('object')
    expect(response.body.data.getMe.email).to.be.a('string')
    expect(response.body.data.getMe.apiKey).not.to.exist
  });

  it('should get GetUsers', async () => {
    yesno.mock([
      {
        request: {
          host: 'localhost',
          method: 'POST',
          path: '/',
          port: 3000,
          protocol: 'http',
        },
        response: {
          body: {
            data: {
              getUsers: easygraphqlTester.mock(getUsersQuery)
            } 
          },
          statusCode: 200,
        },
      }
    ]);
    await getUsers();
    const response = yesno.matching(/\//).response()

    expect(response.body.data.getUsers).to.be.a('array')
  });
});
