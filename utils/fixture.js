const isObject = require('lodash.isobject')

function setFixture (mock, fixture) {
  for (const val of Object.keys(fixture)) {
    if (!mock[val]) {
      throw new Error(`${val} is not called on the query, and it's on the fixture.`)
    }

    if (Array.isArray(mock[val]) && !Array.isArray(fixture[val])) {
      throw new Error(`${val} is not an array and it should be one.`)
    }

    if (typeof mock[val] !== typeof fixture[val]) {
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
