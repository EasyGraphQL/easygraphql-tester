'use strict'

const { parse, validate, findDeprecatedUsages } = require('graphql')
const isObject = require('lodash.isobject')

function validation (schema, doc, opts) {
  if (!isObject(doc)) {
    doc = parse(doc)
  }

  if (opts.validateDeprecated) {
    validateDeprecated(schema, doc)
  }

  const errors = validate(schema, doc)

  if (!opts.mockErrors) {
    handleErrors(errors)
  }
  return errors
}

function validateDeprecated (schema, doc) {
  handleErrors(findDeprecatedUsages(schema, doc))
}

function handleErrors (errors) {
  if (errors.length) {
    throw new Error(errors[0].message)
  }
}

module.exports = validation
