/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const gql = require('graphql-tag')
const EasyGraphQLTester = require('../lib')

const gitHubSchema = fs.readFileSync(path.join(__dirname, 'schema', 'gitHubSchema.gql'), 'utf8')

describe('With gitHubSchema', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(gitHubSchema)
  })

  afterEach(() => {
    tester.clearFixture()
  })

  it('Should pass with multiples queries', () => {
    const query = gql`
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
              totalCount
              edges {
                node {
                  id
                  title
                  viewerDidAuthor
                  state
                }
              }
            }
          }
        }
        licenses {
          name
        }
      }
    `
    tester.test(true, query)
  })

  it('Should pass with multiples queries and variable on the second query', () => {
    const query = gql`
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder, $repoName: String!) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
            }
          }
        }
        licenses {
          name
          repository(name: $repoName) {
            name
          }
        }
      }
    `
    tester.test(true, query)
  })

  it('Should fail with multiples queries and a extra variable', () => {
    let error
    try {
      const query = gql`
        query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder, $repoName: String!) {
          viewer {
            name
            isHireable
            repository(name: $repo) {
              issues(first: $count, orderBy: $orderBy) {
                pageInfo {
                  hasPreviousPage
                  hasNextPage
                  startCursor
                  endCursor
                }
              }
            }
          }
          licenses {
            name
          }
        }
      `
      tester.mock(query)
    } catch (err) {
      error = err
    }

    expect(error).to.exist
    expect(error.message).to.be.eq('Variable "$repoName" is never used in operation "trialQuery"')
  })

  it('Should mock multiples queries', () => {
    const query = gql`
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
              totalCount
              edges {
                node {
                  id
                  title
                  viewerDidAuthor
                  state
                }
              }
            }
          }
        }
        licenses {
          name
        }
      }
    `
    const { data: { viewer, licenses } } = tester.mock(query)
    expect(viewer).to.exist
    expect(viewer.repository).to.exist
    expect(licenses).to.exist
    expect(licenses).to.be.an('array')
  })

  it('Should add fixture to multiples queries', () => {
    const query = gql`
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
              totalCount
              edges {
                node {
                  id
                  title
                  viewerDidAuthor
                  state
                }
              }
            }
          }
        }
        licenses {
          name
        }
      }
    `

    const fixture = {
      data: {
        viewer: {
          name: 'easygraphql'
        },
        licenses: [{
          name: 'Super test'
        }]
      }
    }

    const { data: { viewer, licenses } } = tester.mock({
      query,
      fixture
    })

    expect(viewer).to.exist
    expect(viewer.name).to.be.eq('easygraphql')
    expect(viewer.repository).to.exist
    expect(licenses).to.exist
    expect(licenses).to.be.an('array')
    expect(licenses).to.have.length(1)
    expect(licenses[0].name).to.be.eq('Super test')
  })

  it('Should add fixture to partial response', () => {
    const query = gql`
      {
        licenses {
          id
          name
        }
      }
    `

    {
      const fixture = {
        data: {
          licenses: [
            { id: '1', name: 'license 1' },
            null,
            { id: '3', name: 'license 3' }
          ]
        },
        errors: [{
          message: 'License with ID 2 could not be fetched.',
          locations: [{ line: 3, column: 7 }],
          path: ['licenses', 1, 'name']
        }]
      }

      const { data: { licenses }, errors } = tester.mock({
        query,
        fixture
      })

      expect(licenses).to.exist
      expect(licenses).to.be.an('array')
      expect(licenses).to.have.length(3)
      expect(licenses[1]).to.be.a('null')
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('License with ID 2 could not be fetched.')
    }

    {
      const fixture = {
        data: null,
        errors: [{
          message: 'Licenses could not be fetched.',
          locations: [{ line: 2, column: 2 }],
          path: ['licenses']
        }]
      }

      const { data, errors } = tester.mock({
        query,
        fixture
      })

      expect(data).to.be.a('null')
      expect(errors).to.exist
      expect(errors).to.be.an('array')
      expect(errors[0].message).to.be.eq('Licenses could not be fetched.')
    }
  })

  it('Should not pass with fragments if name variable is missing on repository', () => {
    const query1 = gql`
      query appQuery {
        viewer {
          ...issues_viewer
        }
      }

      fragment issues_viewer on User
        @argumentDefinitions(
          count: {type: "Int", defaultValue: 10}
          cursor: {type: "String"}
          orderBy: {
            type: "IssueOrder"
            defaultValue: {field: CREATED_AT, direction: DESC}
          }
        ) {
        issues(first: $count, after: $cursor, orderBy: $orderBy)
          @connection(key: "viewer_issues") {
          edges {
            node {
              ...issuesNode @relay(mask: false)
            }
          }
        }
      }

      fragment issuesNode on Issue @relay(mask: false) {
        id
        title
        repository(name: "demo") {
          name
        }
        viewerDidAuthor
        state
      }
    `

    tester.test(false, query1)
  })

  it('Should pass with fragments', () => {
    const query1 = gql`
      query appQuery {
        viewer {
          ...issues_viewer
        }
      }

      fragment issues_viewer on User
        @argumentDefinitions(
          count: {type: "Int", defaultValue: 10}
          cursor: {type: "String"}
          orderBy: {
            type: "IssueOrder"
            defaultValue: {field: CREATED_AT, direction: DESC}
          }
        ) {
        issues(first: $count, after: $cursor, orderBy: $orderBy)
          @connection(key: "viewer_issues") {
          edges {
            node {
              ...issuesNode @relay(mask: false)
            }
          }
        }
      }

      fragment issuesNode on Issue @relay(mask: false) {
        id
        title
        repository {
          name
        }
        viewerDidAuthor
        state
      }
    `

    tester.test(true, query1)
  })

  it('Should set fixture with setFixture, before the test', () => {
    const fixture = {
      data: {
        licenses: [
          { id: '1', name: 'license MIT' },
          null,
          { id: '3', name: 'license 3' }
        ]
      },
      errors: [{
        message: 'License with ID 2 could not be fetched.',
        locations: [{ line: 3, column: 7 }],
        path: ['licenses', 1, 'name']
      }]
    }

    tester.setFixture(fixture)
    const query = gql`
      {
        licenses {
          id
          name
        }
      }
    `

    const { data: { licenses }, errors } = tester.mock(query)

    expect(licenses).to.exist
    expect(licenses).to.be.an('array')
    expect(licenses).to.have.length(3)
    expect(licenses[0].id).to.be.eq('1')
    expect(licenses[0].name).to.be.eq('license MIT')
    expect(licenses[1]).to.be.a('null')
    expect(errors).to.exist
    expect(errors).to.be.an('array')
    expect(errors[0].message).to.be.eq('License with ID 2 could not be fetched.')
  })
})
