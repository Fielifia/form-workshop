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
 * Creates a configurable form model independent of the user interface.
 * 
 * The model manages field configuration and provides operations for
 * adding, removing, retrieving and updating fields.
 * 
 * @returns {object} The form model and its public methods.
 */
export function createFormModel() {
  const fields = []

  return {

    /**
     * Return copies of all configured fields in the form.
     * 
     * Each field and its validation rules array are copied so that
     * changes to the returned data do not affect the model's state.
     * 
     * @returns {Array<object>} Copies of the configured fields.
     */
    getFields() {
      return fields.map(field => ({
        ...field,
        validationRules: copyValidationRules(field.validationRules)
      }))
    },

    /**
     * Adds a field to the form model.
     * 
     * The field configuration is validated before it is stored.
     * Field IDs must be unique, and the stored validation rules
     * are copied from the supplied configuration.
     * 
     * @param {object} field - The field configuration to add.
     * @throws {TypeError} If the field configuration is invalid.
     * @throws {Error} If a field with the same ID already exists.
     */
    addField(field) {
      validateField(field)

      if (fields.some(existing => existing.id === field.id)) {
        throw new Error(`A field with ID "${field.id}" already exists.`)
      }
      fields.push({
        id: field.id,
        label: field.label.trim(),
        type: field.type,
        required: field.required,
        validationRules: copyValidationRules(field.validationRules)
      })
    },

    /**
     * Removes a field from the form model by its ID.
     * 
     * @param {string} id - The ID of the field to remove.
     * @returns {boolean} True if the field was removed, otherwise false.
     */
    removeField(id) {
      const index = fields.findIndex(field => field.id === id)

      if (index === -1) {
        return false
      }
      fields.splice(index, 1)
      return true
    },


    /**
     * Updates an existing field without changing its ID.
     * 
     * The resulting field configuration is validated before it replaces
     * the existing field. If validation fails, the existing field remains
     * unchanged.
     * 
     * @param {string} id - The ID of the field to update.
     * @param {object} fieldChanges - The properties to update.
     * @returns {boolean} True if the field was updated, otherwise false.
     * @throws {TypeError} If the resulting field configuration is invalid.
     */
    updateField(id, fieldChanges) {
      const index = fields.findIndex(field => field.id === id)

      if (index === -1) {
        return false
      }

      const updatedField = {
        ...fields[index],
        ...fieldChanges,
        id,
        validationRules: fieldChanges.validationRules === undefined
          ? copyValidationRules(fields[index].validationRules)
          : fieldChanges.validationRules
      }

      validateField(updatedField)

      fields[index] = {
        ...updatedField,
        label: updatedField.label.trim(),
        validationRules: copyValidationRules(updatedField.validationRules)
      }

      return true
    }
  }
}

/**
 * Creates a copy of validation rules.
 * 
 * Strings are immutable, while rule objects are copied to prevent external changes from affecting the model's internal state.
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
 * Checks that the field has a valid ID, label, type, required flag
 * and an array of non-empty validation rule strings.
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
    throw new TypeError(`Unsupported field type: "${field.type}". A field must have a valid type. Allowed types: ${ALLOWED_FIELD_TYPES.join(', ')}.`
    )
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
