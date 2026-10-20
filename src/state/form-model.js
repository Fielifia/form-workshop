export const ALLOWED_FIELD_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'textarea',
  'checkbox',
  'date'
]

const ALLOWED_VALIDATION_RULES = [
  'EmailRule',
  'OnlyLettersRule',
  'OnlyDigitsRule',
  'UppercaseRule',
  'LowercaseRule',
  'SpecialCharacterRule',
  'NoCodeOrLinksRule',
  'MinLengthRule',
  'MaxLengthRule',
  'MatchingFieldsRule'
]

/**
 * Gets the matching rule from a field's validation rules.
 * 
 * @param {Object} field - The field to inspect.
 * @returns {Object|undefined} The matching rule, or undefined if none exists.
 */
function getMatchingRule(field) {
  return field.validationRules.find(
    rule => typeof rule === 'object' &&
      rule.name === 'MatchingFieldsRule'
  )
}

/**
 * Copies validation rules without the matching relationship.
 * 
 * @param {Array<string|object>} rules - Rules to copy.
 * @returns {Array<string|object>} Independent copies of the rules.
 */
function copyRulesWithoutMatching(rules) {
  return copyValidationRules(
    rules.filter(rule =>
      !(typeof rule === 'object' &&
        rule.name === 'MatchingFieldsRule')
    )
  )
}

/**
 * Finds a field by ID.
 * 
 * @param {Array<object>} fields - All configured fields.
 * @param {string} id - The field ID to find.
 * @returns {objet|null} The field, or null if it does not exist.
 */
function findField(fields, id) {
  return fields.find(field => field.id === id) ?? null
}

/**
 * Creates a configurable form model independent of the user interface.
 * 
 * The model manages field configuration and provides operations for
 * adding, removing, retrieving and updating fields.
 * 
 * @returns {object} The form model and its public methods.
 */
export function createFormModel() {
  const fields = []

  /**
   * Return copies of all configured fields.
   * 
   * Each field and its validation rules array are copied so that
   * changes to the returned data do not affect the model's state.
   * 
   * Matching relationships are exposed through matchingFieldId.
   * 
   * @returns {Array<object>} Copies of the configured fields.
   */
  function getFields() {
    return fields.map(field => ({
      ...field,
      validationRules: copyValidationRules(field.validationRules)
    }))
  }

  /**
   *Synchronizes fields that match the specified original field.
   *
   * @param {object} source - The original field.
   * @returns {void}
   */
  function syncMatchingFields(source) {
    fields.forEach(field => {
      if (field.matchingFieldId !== source.id) return

      field.type = source.type
      field.required = source.required
      field.validationRules = copyRulesWithoutMatching(
        source.validationRules
      )
    })
  }

  /**
   * Adds a field to the form model.
   * 
   * The field configuration is validated before it is stored.
   * Field IDs must be unique, and the stored validation rules
   * are copied from the supplied configuration.
   * 
   * Matching fields inherit the type, required state and validation rules of the field they match.
   * 
   * @param {object} field - The field configuration to add.
   * @throws {TypeError} If the field configuration is invalid.
   * @throws {Error} If a field with the same ID already exists.
   */
  function addField(field) {
    validateField(field)

    if (findField(fields, field.id)) {
      throw new Error(`A field with ID "${field.id}" already exists.`)
    }

    const matchingRule = getMatchingRule(field)
    const source = matchingRule
      ? findField(fields, matchingRule.value)
      : null

    if (matchingRule && !source) {
      throw new TypeError('The matching fields does not exist.')
    }

    if (source?.matchingFieldId) {
      throw new TypeError(
        `A matching field cannot match another matching field.`
      )
    }

    const newField = {
      id: field.id,
      label: field.label.trim(),
      type: source ? source.type : field.type,
      required: source ? source.required : field.required,
      validationRules: source
        ? copyRulesWithoutMatching(source.validationRules)
        : copyRulesWithoutMatching(field.validationRules)
    }

    if (source) {
      newField.matchingFieldId = source.id
    }

    fields.push(newField)
  }

  /**
   * Removes a field and releases fields that match it.
   * 
   * Released fields retain their latest inherited settings.
   * 
   * @param {string} id - The ID of the field to remove.
   * @returns {boolean} True if removed, otherwise false.
   */
  function removeField(id) {
    const index = fields.findIndex(field => field.id === id)

    if (index === -1) return false

    fields.forEach(field => {
      if (field.matchingFieldId === id) {
        delete field.matchingFieldId
      }
    })

    fields.splice(index, 1)
    return true
  }

  /**
   * Updates an field and synchronizes its matching fields.
   * 
   * @param {string} id - The ID of the field to update.
   * @param {object} fieldChanges - The properties to update.
   * @returns {boolean} True if updated, otherwise false.
   * @throws {TypeError} If the resulting field configuration is invalid.
   */
  function updateField(id, changes) {
    const index = fields.findIndex(field => field.id === id)

    if (index === -1) return false

    const current = fields[index]
    const suppliedRules = changes.validationRules === undefined
      ? copyValidationRules(current.validationRules)
      : changes.validationRules

    const matchingRule = getMatchingRule({
      validationRules: suppliedRules
    })

    const source = matchingRule
      ? findField(fields, matchingRule.value)
      : null

    if (matchingRule && !source) {
      throw new TypeError('The matching fields does not exist.')
    }

    if (source && source.id === id) {
      throw new TypeError('A field cannot match itself.');

    }

    if (source?.matchingFieldId) {
      throw new TypeError(
        `A matching field cannot match another matching field.`
      )
    }

    const updatedField = {
      ...current,
      ...changes,
      id,
      validationRules: source
        ? copyRulesWithoutMatching(source.validationRules)
        : copyRulesWithoutMatching(suppliedRules)
    }

    if (source) {
      updatedField.type = source.type
      updatedField.required = source.required
      updatedField.matchingFieldId = source.id
    } else {
      delete updateField.matchingFieldId
    }

    validateField(updatedField)

    fields[index] = {
      ...updatedField,
      label: updatedField.label.trim(),
      validationRules: copyValidationRules(
        updatedField.validationRules
      )
    }

    syncMatchingFields(fields[index])

    return true
  }

  return {
    getFields,
    addField,
    removeField,
    updateField
  }
}

/**
 * Creates copies of validation rules.
 * 
 * @param {Array<string|object>} validationRules - Rules to copy.
 * @returns {Array<string|object>} Copies of the validation rules.
 */
function copyValidationRules(validationRules) {
  return validationRules.map(rule => (
    typeof rule === 'string' ? rule : { ...rule }
  ))
}

/**
 * Validates a field configuration.
 * 
 * @param {object} field - The field to validate.
 * @throws {TypeError} If the field is invalid or contains invalid properties.
 * @returns {void}
 */
function validateField(field) {
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    throw new TypeError('A field must be an object.')
  }

  if (typeof field.id !== 'string' || field.id.trim() === '') {
    throw new TypeError('A field must have a non-empty string ID.')
  }

  if (typeof field.label !== 'string' || field.label.trim() === '') {
    throw new TypeError('A field must have a non-empty label.')
  }

  if (!ALLOWED_FIELD_TYPES.includes(field.type)) {
    throw new TypeError(`Unsupported field type: "${field.type}".`)
  }

  if (typeof field.required !== 'boolean') {
    throw new TypeError('The required property must be a boolean.')
  }

  if (!Array.isArray(field.validationRules)) {
    throw new TypeError('Validation rules must be an array.')
  }

  const ruleNames = field.validationRules.map(rule =>
    typeof rule === 'string' ? rule : rule?.name
  )

  for (const ruleName of ruleNames) {
    if (!ALLOWED_VALIDATION_RULES.includes(ruleName)) {
      throw new TypeError(
        `Unsupported validation rule: "${ruleName}".`
      )
    }
  }

  if (new Set(ruleNames).size !== ruleNames.length) {
    throw new TypeError(
      `A field cannot contain duplicate validation rules.`
    )
  }

  const validRule = rule => {
    if (typeof rule === 'string') {
      return rule.trim() !== ''
    }

    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      return false
    }

    if (
      rule.name === 'MinLengthRule' ||
      rule.name === 'MaxLengthRule'
    ) {
      return Number.isInteger(rule.value) && rule.value >= 0
    }

    if (rule.name === 'MatchingFieldsRule') {
      return typeof rule.value === 'string' &&
        rule.value.trim() !== ''
    }

    return false
  }

  if (!field.validationRules.every(validRule)) {
    throw new TypeError(
      'Validation rules contain an invalid rule configuration.'
    )
  }
}
