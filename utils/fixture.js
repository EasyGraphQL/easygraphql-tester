const isObject = require('lodash.isobject')
const isEmpty = require('lodash.isempty')

function setFixture (mock, fixture) {
  if (typeof fixture === 'undefined') {
    return mock
  }

  if (Array.isArray(fixture)) {
    const fixtureArr = []
    fixture.forEach(val => {
      if (mock[0] === null) {
        return val
      }

      const result = handleObjectFixture(mock[0], val)
      fixtureArr.push(Object.assign({}, result))
    })
    return fixtureArr
  } else {
    return handleObjectFixture(mock, fixture)
  }
}

function handleObjectFixture (mock, fixture) {
  for (const val of Object.keys(fixture)) {
    if (typeof mock[val] === 'undefined') {
      throw new Error(`${val} is not called on the query, and it's on the fixture.`)
    }

    if (Array.isArray(mock[val]) && !Array.isArray(fixture[val])) {
      throw new Error(`${val} is not an array and it should be one.`)
    }

    // if the mock[val] is empty it is because it's a custom scalar, in this case
    // it should not be validated
    if (mock[val] !== null && typeof mock[val] !== typeof fixture[val] && !isEmpty(mock[val])) {
      throw new Error(`${val} is not the same type as the document.`)
    }

    if (Array.isArray(fixture[val])) {
      const fixtureArr = []
      for (const arrVal of fixture[val]) {
        if (isObject(arrVal)) {
          const result = handleNestedObjects(mock[val][0], arrVal)
          fixtureArr.push(result)
        } else {
          fixtureArr.push(arrVal)
        }
      }

      mock[val] = fixtureArr
    } else if (isObject(fixture[val])) {
      mock[val] = setFixture(mock[val], fixture[val])
    } else {
      mock[val] = fixture[val]
    }
  }
  return mock
}

function handleNestedObjects (mock, obj) {
  for (const val of Object.keys(obj)) {
    if (isObject(obj[val])) {
      obj[val] = handleNestedObjects(mock[val], obj[val])
    } else {
      obj = { ...mock, ...obj }
    }
  }

  return obj
}

module.exports = { setFixture }
