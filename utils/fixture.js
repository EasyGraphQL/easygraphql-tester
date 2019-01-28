const isObject = require('lodash.isobject')

function setFixture (mock, fixture, name, selectedType, schema) {
  fixture = fixture !== undefined ? fixture[name] : undefined

  if (fixture === undefined) {
    return mock
  }

  return validateFixture(mock, fixture, selectedType, schema, name)
}

function validateFixture (mock, fixture, selectedType, schema, name) {
  if (selectedType.noNull && fixture === null) {
    throw new Error(`${selectedType.name} can't be null.`)
  }

  if (fixture === null) {
    return null
  }

  if (selectedType.isArray && !Array.isArray(fixture)) {
    throw new Error(`${selectedType.name} fixture is not an array and it should be one.`)
  }

  if (schema[selectedType.type]) {
    const fields = schema[selectedType.type].fields

    if (Array.isArray(fixture)) {
      return fixture.map(val => {
        // If the autoMock is false, set an empty object to set the value after validation
        const mockedVal = mock[0] || {}

        return validateFixture(mockedVal, val, schema[selectedType.type], schema, name)
      })
    } else if (isObject(fixture)) {
      for (const val of Object.keys(fixture)) {
        const selectedField = fields.filter(field => field.name === val)
        // If the autoMock is false, set an empty object to set the value after validation
        const mockedVal = mock[val] || {}
        // If it's extra fields on the fixture, continue
        if (!selectedField.length) {
          continue
        }

        // If it is a custom scalar, should not validate the typeof
        if (isObject(mockedVal) && Object.keys(mockedVal).length === 1 && mockedVal.__typename) {
          mock[val] = fixture[val]
        } else {
          mock[val] = validateFixture(mockedVal, fixture[val], selectedField[0], schema, name)
        }
      }

      return mock
    }
  } else if (Array.isArray(fixture)) {
    fixture.forEach(val => {
      if (selectedType.isArray && selectedType.noNullArrayValues && val === null) {
        throw new Error(`${selectedType.name} inside an array can't be null.`)
      }

      validateType(val, selectedType, name)
    })
  } else if (isObject(fixture)) {
    const fields = selectedType.fields
    for (const val of Object.keys(fixture)) {
      // If the autoMock is false, set an empty object to set the value after validation
      const mockedVal = mock[val] || {}
      const selectedField = fields.filter(field => field.name === val)

      if (!selectedField.length) {
        throw new Error(`${name} fixture is not the same type as the document.`)
      }
      mock[val] = validateFixture(mockedVal, fixture[val], selectedField[0], schema, name)
    }
    return Object.assign({}, mock)
  }

  validateType(fixture, selectedType, name)

  return fixture !== undefined ? fixture : mock
}

function validateType (fixture, selectedType, name) {
  name = selectedType.name || name
  switch (typeof fixture) {
    case 'number':
      if (selectedType.type !== 'Int' && selectedType.type !== 'Float') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    case 'string':
      if (selectedType.type !== 'String' && selectedType.type !== 'ID') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    case 'boolean':
      if (selectedType.type !== 'Boolean') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    default:
      break
  }
}

function setFixtureError (fixtureErrors) {
  if (!Array.isArray(fixtureErrors)) {
    throw new Error('The errors fixture should be an array')
  }
  return fixtureErrors
}

module.exports = { setFixture, setFixtureError }
