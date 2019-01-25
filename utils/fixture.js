const isObject = require('lodash.isobject')
const isEmpty = require('lodash.isempty')

function setFixture (mock, fixture, name) {
  if (fixture === null) {
    return null
  }

  fixture = fixture && fixture[name] ? fixture[name] : undefined

  if (fixture === undefined) {
    return mock
  }

  if (Array.isArray(fixture)) {
    return fixture.map((val) => {
      if (isObject(val)) {
        return Object.assign({}, handleObjectFixture(mock[0], val, name))
      }

      return scalarValidation(mock[0], val, name)
    })
  } else if (isObject(fixture)) {
    return handleObjectFixture(mock, fixture, name)
  } else {
    return scalarValidation(mock, fixture, name)
  }
}

function scalarValidation (mock, fixture, name) {
  if (fixture === null) {
    return null
  }

  if (Array.isArray(mock) && !Array.isArray(fixture)) {
    throw new Error(`${name} fixture is not an array and it should be one.`)
  }

  if (typeof mock !== typeof fixture) {
    throw new Error(`${name} fixture is not the same type as the document.`)
  }

  return fixture !== undefined ? fixture : mock
}

function handleObjectFixture (mock, fixture, name) {
  for (const val of Object.keys(fixture)) {
    // If the value is defined on the fixture but not on the query, skip that value
    if (typeof mock[val] === 'undefined') {
      continue
    }

    // If it is a scalar, it should be an empty object instead of the __typename
    if (isObject(mock[val]) && Object.keys(mock[val]).length === 1 && mock[val].__typename) {
      mock[val] = {}
    }

    if (Array.isArray(mock[val]) && !Array.isArray(fixture[val])) {
      throw new Error(`${val} is not an array and it should be one.`)
    }

    // if the mock[val] is empty it is because it's a custom scalar, in this case
    // it should not be validated
    if (
      mock[val] !== null &&
      typeof mock[val] !== typeof fixture[val] &&
      !isEmpty(mock[val])
    ) {
      throw new Error(`${val} is not the same type as the document.`)
    }

    if (Array.isArray(fixture[val])) {
      const fixtureArr = fixture[val].map((value) => {
        if (isObject(value)) {
          return handleNestedObjects(mock[val][0], value, name)
        } else {
          return value
        }
      })

      mock[val] = fixtureArr
    } else if (isObject(fixture[val])) {
      mock[val] = setFixture(mock[val], fixture, val)
    } else {
      mock[val] = fixture[val]
    }
  }
  return mock
}

function handleNestedObjects (mock, obj, name) {
  for (const val of Object.keys(obj)) {
    if (isObject(obj[val])) {
      obj[val] = handleNestedObjects(mock[val], obj[val], name)
    } else {
      obj[val] = scalarValidation(mock[val], obj[val], name)
    }
  }

  return obj
}

function setFixtureError (fixtureErrors) {
  if (!Array.isArray(fixtureErrors)) {
    throw new Error('The errors fixture should be an array')
  }
  return fixtureErrors
}

module.exports = { setFixture, setFixtureError }
