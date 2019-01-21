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
    const { viewer, licenses } = tester.mock(query)
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
      viewer: {
        name: 'easygraphql'
      },
      licenses: [{
        name: 'Super test'
      }]
    }

    const { viewer, licenses } = tester.mock({
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
})
