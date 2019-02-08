const isObject = require('lodash.isobject')

function setFixture (mock, operation, parsedQuery, parsedSchema, opts) {
  const mockedFixture = Object.assign({}, mock[operation])

  if (Array.isArray(parsedQuery)) {
    parsedQuery.forEach(name => {
      const { fixture, saveFixture = false, autoMock = true } = opts

      const operationSchema = parsedSchema[operation].fields.filter(el => el.name === name)[0]
      if (!autoMock && fixture.data && fixture.data[name] !== undefined) {
        mockedFixture[name] = validateFixture({}, fixture.data[name], operationSchema, parsedSchema)
      } else {
        if (fixture && fixture.data && fixture.data[name] !== undefined) {
          mockedFixture[name] = validateFixture(mock[operation][name], fixture.data[name], operationSchema, parsedSchema)
          if (saveFixture) {
            mock[operation][name] = mockedFixture[name]
          }
        }
      }
    })
  }

  return mockedFixture
}

function validateFixture (usedMock, fixture, selectedType, schema, name) {
  const mock = Object.assign({}, usedMock)

  if (fixture === null) {
    return null
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

    return fixture
  } else if (Array.isArray(fixture)) {
    fixture.forEach(val => val)
    return fixture
  } else if (isObject(fixture)) {
    const fields = selectedType.fields
    for (const val of Object.keys(fixture)) {
      // If the autoMock is false, set an empty object to set the value after validation
      const mockedVal = mock[val] || {}
      const selectedField = fields.filter(field => field.name === val)

      mock[val] = validateFixture(mockedVal, fixture[val], selectedField[0], schema, name)
    }
    return mock
  }

  return fixture !== undefined ? fixture : mock
}

function setFixtureError (fixtureErrors) {
  if (!Array.isArray(fixtureErrors)) {
    throw new Error('The errors fixture should be an array')
  }
  return fixtureErrors
}

module.exports = { setFixture, setFixtureError }
