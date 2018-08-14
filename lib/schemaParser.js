'use strict'

const { parse, Kind } = require('graphql')

function getOperationTypes (schema, nodeMap) {
  const opTypes = {}
  const s = parseSchema(nodeMap)
  schema.operationTypes.forEach((operationType) => {
    const typeName = operationType.type.name.value
    const operation = operationType.operation

    if (opTypes[operation]) {
      throw new Error('Must provide only one ' + operation + ' type in schema.')
    }
    if (!nodeMap[typeName]) {
      throw new Error('Specified ' + operation + ' type "' + typeName + '" not found in document.')
    }

    opTypes[operation] = {
      type: convertType(operationType.kind),
      operation,
      field: typeName
    }
  })

  return Object.assign({ schemaDefinition: opTypes }, s)
}

function schemaBuilder (doc) {
  let schemaDef = void 0

  const nodeMap = Object.create(null)
  const directiveDefs = []
  for (let i = 0; i < doc.definitions.length; i++) {
    const d = doc.definitions[i]
    switch (d.kind) {
      case Kind.SCHEMA_DEFINITION:
        if (schemaDef) {
          throw new Error('Must provide only one schema definition.')
        }
        schemaDef = d
        break
      case Kind.SCALAR_TYPE_DEFINITION:
      case Kind.OBJECT_TYPE_DEFINITION:
      case Kind.INTERFACE_TYPE_DEFINITION:
      case Kind.ENUM_TYPE_DEFINITION:
      case Kind.UNION_TYPE_DEFINITION:
      case Kind.INPUT_OBJECT_TYPE_DEFINITION:
        // Get the name of the type on the schema
        const typeName = d.name.value
        // Check if it is already define, it can only be one time
        if (nodeMap[typeName]) {
          throw new Error('Type "' + typeName + '" was defined more than once.')
        }
        nodeMap[typeName] = d
        break
      case Kind.DIRECTIVE_DEFINITION:
        directiveDefs.push(d)
        break

      default:
        break
    }
  }

  const operationTypes = schemaDef ? getOperationTypes(schemaDef, nodeMap) : parseSchema(nodeMap)

  return operationTypes
}

/**
 * Find the type of a field on the Schema
 * @param node - The graph schema
 * @param typeInfo - The object with the recursive values
 * @returns {{type: String, noNull: Boolean, isArray: Boolean}}
 */
function findType (node, typeInfo) {
  typeInfo = typeInfo || { noNull: false, isArray: false }

  if (!node) {
    return typeInfo
  }

  if (node.kind === 'NonNullType') {
    typeInfo.noNull = true
  }

  if (node.kind === 'ListType') {
    typeInfo.isArray = true
  }

  if (node.name) {
    typeInfo.type = node.name.value
  }

  return findType(node.type, typeInfo)
}

/**
 * Find the arguments that are used on the Schema
 * @param node - The graph schema
 * @returns {[{name: String, noNull: Boolean, isArray: Boolean, type: String}]}
 */
function findArguments (node) {
  if (!node) {
    return []
  }

  return node.map(arg => {
    const name = arg.name.value
    const fieldType = findType(arg.type)

    return Object.assign({ name }, fieldType)
  })
}

/**
 * Convert the Schema type
 * @param type - Can be InputObjectTypeDefinition (used to receive values) or ObjectTypeDefinition (as response)
 * @returns {string}
 */
function convertType (type) {
  switch (type) {
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
      return 'InputType'
    case Kind.OBJECT_TYPE_DEFINITION:
      return 'ObjectType'
    case Kind.OPERATION_TYPE_DEFINITION:
      return 'OperationType'

    default:
      return type
  }
}

function parseSchema (types) {
  const parsedTypes = {}
  // Loop all the types (Scalar, Type, Input, Query, Mutation)
  for (const key of Object.keys(types)) {
    const type = types[key]
    const parsedType = {
      type: convertType(type.kind),
      description: type.description,
      fields: []
    }

    if (type.fields) {
      const fields = []
      type.fields.map(field => {
        // Set the name of the field used on the Schema
        const name = field.name.value
        // Get the type of the field, also check if is require and array
        const fieldType = findType(field.type)
        // Get the arguments that are require on the Schema
        const typeArguments = findArguments(field.arguments)

        const newField = Object.assign({ name, arguments: typeArguments }, fieldType)
        fields.push(newField)
      })
      parsedType.fields = fields
    }
    parsedTypes[key] = parsedType
  }

  return parsedTypes
}

function schemaParser (source, options) {
  return schemaBuilder((0, parse)(source, options), options)
}

module.exports = schemaParser
