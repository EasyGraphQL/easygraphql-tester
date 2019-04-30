<h1 align="center">
  <img src="https://raw.githubusercontent.com/EasyGraphQL/easygraphql-now/master/logo.png" alt="EasyGraphQL Mock " width="350">
  <br>
    easygraphql-tester
  <br>
  <br>
</h1>

[![Coverage Status](https://coveralls.io/repos/github/EasyGraphQL/easygraphql-tester/badge.svg?branch=master)](https://coveralls.io/github/EasyGraphQL/easygraphql-tester?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/EasyGraphQL/easygraphql-tester.svg)](https://greenkeeper.io/)

[`easygraphql-tester`](https://github.com/EasyGraphQL/easygraphql-tester) is node library created to make GraphQL tests based on the schema; it's used
to test the queries, mutations and schema on the easiest way possible.

It will check:
+ If the  query/mutation/subscription is defined on the schema.
+ If the requested fields are defined.
+ If the arguments are valid.
+ If the input on a mutation is valid.
+ If the union is valid.
+ And much more....

## Installation

To install the package on your project just run on the root of your project
```shell
$ npm install easygraphql-tester --save-dev
```

[`easygraphql-tester`](https://github.com/EasyGraphQL/easygraphql-tester) can be used in two ways; the first one is using `.tester` as an assertion of the query/mutation, and the second one is using `.mock` to return the mocked query/mutation.

## How to use it?

+ Import [`easygraphql-tester`](https://github.com/EasyGraphQL/easygraphql-tester) package.
+ Read the schema.
+ Initialize the tester, and pass the schema as an argument.
  + If there are multiples schemas pass an array with the schemas an argument.
  + **Note**: In order to use multiples schema files, the queries and mutations must be extended.


### One schema file
```js
'use strict' 

const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')

const tester = new EasyGraphQLTester(userSchema)
```

### Multiples schemas files
```js
'use strict' 

const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

const tester = new EasyGraphQLTester([userSchema, familySchema])
```

### Using GraphQL.js
```js
'use strict'

const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql')
const EasyGraphQLTester = require('easygraphql-tester')

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        }
      }
    }
  })
});

const tester = new EasyGraphQLTester(schema)
```

## Resolvers

To test GraphQL resolvers, there is something extra to do in case you are not using graphql-js.
This is going to be `async`.

### Without graphql-js
If you are not using graphql-js, you might pass the resolvers as second argument to the
constructor in order to test the resolvers.

```js
'use strict' 

const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const resolvers = require('./resolvers')
const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')

const tester = new EasyGraphQLTester(userSchema, resolverss)
```

### Testing the resolvers

After you initializate the class, you can use the method `graphql` and it'll receive
4 arguments, the only one that is required is the first argument, those arguments are:

+ `query`: The query/mutation you want to test.
+ `rootValue`: It's going to be the rootValue to pass to the resolver.
+ `contextValue`: It's going to be the context to pass to the resolver.
+ `variableValues`: It's going to be the variables that the query/mutation are going to use.

```js
'use strict' 

const EasyGraphQLTester = require('easygraphql-tester')

const schema = `
  type FamilyInfo {
    id: ID!
    isLocal: Boolean!
  }

  type Query {
    getFamilyInfoByIsLocal(isLocal: Boolean!): FamilyInfo
  }
`

const query = `
  query TEST($isLocal: Boolean!) {
    getFamilyInfoByIsLocal(isLocal: $isLocal) {
      id
      isLocal
    }
  }
`

function getFamilyInfoByIsLocal(__, args, ctx) {
  return {
    id: 1,
    isLocal: args.isLocal
  }
}

const resolvers = {
  Query: {
    getFamilyInfoByIsLocal    
  }
}

const tester = new EasyGraphQLTester(schema, resolvers)

tester.graphql(query, undefined, undefined, { isLocal: false })
  .then(result => console.log(result))
  .catch(err => console.log(err))

// result
// {
//   "data": {
//     "getFamilyInfoByIsLocal": {
//       "id": "1",
//       "isLocal": false
//     }
//   }
}
```

## Assertion

[`easygraphql-tester`](https://github.com/EasyGraphQL/easygraphql-tester) works as an assertion library used to make tests **with your favorite test runner**.

To use it as an assertion library, you must follow the next steps:

+ Define a Query or Mutation to test.
+ Pass as first argument, a boolean to `.test(true)` or `.test(false)`.
  + true: if it is fine, everything should work fine.
  + false: if it should fail, there is an error or invalid field on the query/mutation or arguments/input.
+ Pass as second argument, the query/mutation to test.
+ The third argument is required **if it is a mutation**, it must be an object with the fields of the input

The next example is going to be made with mocha, but it can be done **with your favorite test runner**. 

### Mocha example
```js
'use strict'

const fs = require('fs')
const path = require('path')
const EasyGraphQLTester = require('../lib')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

describe('Test my queries, mutations and subscriptions', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester([userSchema, familySchema])
  })

  describe('Should pass if the query is invalid', () => {
    it('Invalid query getUser', () => {
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
      // First arg: false, there is no invalidField on the schema.
      tester.test(false, invalidQuery)
    })

    it('Should pass if the query is valid', () => {
      const validQuery = `
        {
          getMeByTestResult(result: 4.9) {
            email
          }
        }
      `
      tester.test(true, validQuery)
    })

    it('Should pass if the mutation is valid', () => {
      const mutation = `
        mutation UpdateUserScores($scores: ScoresInput!) {
          updateUserScores(scores: $scores) {
            email
            scores
          }
        }
      `
      tester.test(true, mutation, {
        scores: {
          scores: [1, 2, 3]
        }
      })
    })

    it('Should not pass if one value on the mutation input is invalid', () => {
      const mutation = `
        mutation UpdateUserScores($scores: ScoresInput!) {
          updateUserScores(scores: $scores) {
            email
            scores
          }
        }
      `
      // First arg: false, there is no invalidField on the schema.
      tester.test(false, mutation, {
        scores: {
          scores: [1],
          invalidField: true
        }
      })
    })

    it('Should search', () => {
      const query = `
        {
          search(id: "1") {
            ... on User {
              id
            }
            ... on FamilyInfo {
              id
              father {
                username
              }
              brothers {
                username
              }
            }
          }
        }
      `

      tester.test(true, query)
    })

    it('Should test a subscription', () => {
      const subscription = `
        subscription {
          newUsers(limit: 1) {
            id
            username
            email
          } 
        }
      `

      tester.test(true, subscription)
    })
  })
})
```

## Mocking Queries and Mutations

[`easygraphql-tester`](https://github.com/EasyGraphQL/easygraphql-tester) can works as a mocker of your query or mutation, using it is simple.

Call the method `.mock()` and pass an object with this options:

+ query: It'll be the query/mutation to test.
+ variables: This is required **if it is a mutation**, it must be an object with the fields of the input.
+ fixture: This is optional, it'll be an object with the key `data` and inside it
  the name of the query/mutation/subscription and the fields to set.
+ saveFixture: By default is `false`, if you pass fixtures, and set it to `true` when you make the same query again,
  it will return the fixture value.
+ validateDeprecated: If you want to validate if the query is requesting a deprecated field, set this option to `true`
  and it'll return an error if a field is deprecated.
+ mockErrors: If you want to mock the errors instead of throwing it, set this option to `true` and now, the responsw will have
  `{ data: ..., errors: [...] }`

The result will have top level fields, it means that the result will be an object
with a property that is going to be `data` and inside it the name (top level field) 
of the query or alias with the mocked result.

*In case you have a custom scalar, set the value on the fixture, if it's not set it will be `{}`*

### Fixtures:

There are two ways to set the fixture on a operation:

#### Operation options:
Set the fixture as an option when testing a query/mutation/subscription

E.g
```js
const fixture = {
  data: {
    getUser: {
      id: '1',
      name: 'EasyGraphQL'
    }
  }
}

const { data: { getUser } } = tester.mock({ query, fixture })
```

#### `setFixture()` method
Also, the fixture can be set before the test using `.setFixture()` method from the constructor,
it'll receive two arguments; the first one is going to be the fixture, and the second one will be
an object of options to set if it should auto mock the extra fields that are on the query but are not
on the fixture, by default it's `true`.

Run `tester.clearFixture()` to return the fixture to `null` and `autoMock = true` in case you
set it to `false`

E.g
```js
const tester = new EasyGraphQLTester([userSchema, familySchema])

const fixture = {
  data: {
    getUser: {
      id: '1',
      name: 'EasyGraphQL'
    }
  }
}

tester.setFixture(fixture, { autoMock: false })
const { data: { getUser } } = tester.mock({ query })
tester.clearFixture()
```

### Mock example
```js
'use strict'

const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const userSchema = fs.readFileSync(path.join(__dirname, 'schema', 'user.gql'), 'utf8')
const familySchema = fs.readFileSync(path.join(__dirname, 'schema', 'family.gql'), 'utf8')

const tester = new EasyGraphQLTester([userSchema, familySchema])

const query = `
  {
    getUser(id: "1") {
      id
      name
      familyInfo {
        lastName
        email
      }
    }
  }
`

const fixture = {
  data: {
    getUser: {
      id: '1',
      name: 'EasyGraphQL'
    }
  }
}

const { data: { getUser } } = tester.mock({ query, fixture, validateDeprecated: true })
const { errors } = tester.mock({ 
  query, 
  fixture: {
    errors: [
      {
        "message": "Cannot query field \"invalidField\" on type \"FamilyInfo\".",
        "locations": [
          {
            "line": 7,
            "column": 5
          }
        ]
      }
    ]
  }
})

const queryWithAlias = `
  {
    firstUser: getUser(id: "1") {
      id
    }
  }
`
const { data: { firstUser } } = tester.mock({ query: queryWithAlias })


const mutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`
const input = {
  input: {
    name: 'test'    
  }
}

const { data: { createUser } } = tester.mock({ query: mutation, variables: input })
```

### Mock result
```js
// getUser
{ 
  id: '1',
  name: 'EasyGraphQL',
  familyInfo: [
    { 
      lastName: 'Bartoletti',
      email: 'YSjsYuV@wtnK.com'
    },
    { 
      lastName: 'Bartoletti',
      email: 'YSjsYuV@wtnK.com'
    },
    { 
      lastName: 'Bartoletti',
      email: 'YSjsYuV@wtnK.com'
    }
  ]
}

// errors
{
  [
    {
      "message": "Cannot query field \"invalidField\" on type \"FamilyInfo\".",
      "locations": [
        {
          "line": 7,
          "column": 5
        }
      ]
    }
  ]
}

//firstUser
{
  id: '93'
}


// createUser
{
  id: '93',
  name: 'Tony Patrick'
}
```

## Demo
Here is a [Demo](https://codesandbox.io/embed/42m2rx71j4?previewwindow=tests&view=preview) that can be useful!

# License
### The MIT License

Copyright (c) 2018 EasyGraphQL

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
