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

        mock[val] = validateFixture(mockedVal, fixture[val], selectedField[0], schema, name)
      }

      return mock
    }

    if (schema[selectedType.type].type === 'ScalarTypeDefinition') {
      return fixture
    }

    return validateType(fixture, schema[selectedType.type], name)
  } else if (Array.isArray(fixture)) {
    fixture.forEach(val => validateType(val, selectedType, name))
    return fixture
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

  if (selectedType.isArray && selectedType.noNullArrayValues && fixture === null) {
    throw new Error(`${name} inside an array can't be null.`)
  }

  switch (selectedType.type) {
    case 'Int':
    case 'Float':
      if (typeof fixture !== 'number') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    case 'String':
    case 'ID':
      if (typeof fixture !== 'string') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    case 'Boolean':
      if (typeof fixture !== 'boolean') {
        throw new Error(`${name} is not the same type as the document.`)
      }
      break

    default:
      throw new Error(`${name} is not the same type as the document.`)
  }
}

function setFixtureError (fixtureErrors) {
  if (!Array.isArray(fixtureErrors)) {
    throw new Error('The errors fixture should be an array')
  }
  return fixtureErrors
}

module.exports = { setFixture, setFixtureError }
