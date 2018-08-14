<h1 align="center">
  <img src="https://cdn.rawgit.com/EasyGraphQL/easygraphql-mock/baab331c/EasyGraphQL.png" alt="EasyGraphQL Mock " width="350">
  <br>
  EasyGraphQL Tester
  <br>
  <br>
</h1>

EasyGraphQL tester is a node library used to test on an easy way the queries, mutations, and schema on
using GraphQL.

The tester will check:
+ If the operation name is defined on the schema
+ If the requested fields are defined
+ If the arguments are valid
+ If the input on a mutation is valid
+ And more....

## Installation
```bash
$ npm install easygraphql-tester --save
```

## Usage
To get started with the tester, you might need to follow the next steps:

### First step
+ Import `EasyGraphQLTester` package.
+ Read the schema.
+ Initialize the tester, and pass the schema as an argument.
  
```js
const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

const tester = new EasyGraphQLTester(schemaCode)
```

### Query
+ Define the query
+ Pass the query to `tester.test(query)`

```js
const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

const tester = new EasyGraphQLTester(schemaCode)

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
```
`tester.test(query)` will return a mock of the query, if a field is invalid it will return a error.

#### Arguments
The query can receive arguments, those arguments are going to be validated with the schema
```js
const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

const tester = new EasyGraphQLTester(schemaCode)

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

const getUserByUsername = `
  {
    getUserByUsername(username: test, name: test) {
      email
    }
  }
`
const getMe = tester.test(query)
const userByUsername = tester.test(getUserByUsername)
```

### Mutation
The mutation needs the schema and also the variables.
```js
const EasyGraphQLTester = require('easygraphql-tester')
const fs = require('fs')
const path = require('path')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

const tester = new EasyGraphQLTester(schemaCode)

const mutation = `
  mutation CreateUser{
    createUser {
      email
    }
  }
`
const test = tester.test(mutation, {
  email: 'test@test.com',
  username: 'test',
  fullName: 'test',
  password: 'test'
})
```

### EasyGraphQL Tester with Mocha & Chai
```js
'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const EasyGraphQLTester = require('../lib')

const schemaCode = fs.readFileSync(path.join(__dirname, 'schema', 'schema.gql'), 'utf8')

describe('Mutation', () => {
  let tester

  before(() => {
    tester = new EasyGraphQLTester(schemaCode)
  })

  describe('Should throw an error if variables are missing', () => {
    it('Should throw an error if the variables are missing', () => {
      let error
      try {
        const mutation = `
          mutation CreateUser{
            createUser {
              email
            }
          }
        `
        tester.test(mutation)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.be.eq('Variables are missing')
    })
  })

  describe('Should return selected fields', () => {
    it('Should return selected fields', () => {
      const mutation = `
        mutation CreateUser{
          createUser {
            email
          }
        }
      `
      const test = tester.test(mutation, {
        email: 'test@test.com',
        username: 'test',
        fullName: 'test',
        password: 'test'
      })

      expect(test).to.exist
      expect(test.email).to.be.a('string')
    })
  })
})
```


## Example
Here is a [Example](https://github.com/EasyGraphQL/easygraphql-tester/tree/master/test) that can be useful!

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