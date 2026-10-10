const ALLOWED_FIELD_TYPES = [
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

/**
 * Creates a configurable form model.
 * The model is independent of the user interface.
 */
export function createFormModel() {
  const fields = []

  return {
    getFields() {
      return fields.map(field => ({
        ...field,
        validationRules: [...field.validationRules]
      }))
    },

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
        validationRules: [...field.validationRules]
      })
    },

    removeField(id) {
      const index = fields.findIndex(field => field.id === id)

      if (index === -1) {
        return false
      }
      fields.splice(index, 1)
      return true
    },

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
          ? [...fields[index].validationRules]
          : fieldChanges.validationRules
      }

      validateField(updatedField)

      fields[index] = {
        ...updatedField,
        label: updatedField.label.trim(),
        validationRules: [...updatedField.validationRules]
      }

      return true
    }
  }
}

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
    throw new TypeError(`Unsupported field type: "${field.type}". A field must have a valid type. Allowed types: ${ALLOWED_FIELD_TYPES.join(', ')}.`)
  }

  if (typeof field.required !== 'boolean') {
    throw new TypeError('The required property must be a boolean.')
  }

  if (!Array.isArray(field.validationRules)) {
    throw new TypeError('Validation rules must be an array.')
  }

  if (!field.validationRules.every(rule => typeof rule === 'string' && rule.trim() !== '')) {
    throw new TypeError('Each validation rule must be non-empty string.')
  }
}
