import { ALLOWED_FIELD_TYPES } from '../state/form-model.js'

const AVAILABLE_VALIDATION_RULES = [
  { value: 'EmailRule', label: 'Valid email address' },
  { value: 'OnlyLettersRule', label: 'Letters only' },
  { value: 'OnlyDigitsRule', label: 'Digits only' },
  { value: 'UppercaseRule', label: 'Uppercase letter' },
  { value: 'LowercaseRule', label: 'Lowercase letter' },
  { value: 'SpecialCharacterRule', label: 'Special character' },
  { value: 'NoCodeOrLinksRule', label: 'No code or links' }
]

const RULE_CONFLICTS = {
  OnlyDigitsRule: [
    'OnlyLettersRule',
    'EmailRule',
    'SpecialCharacterRule',
    'UppercaseRule',
    'LowercaseRule'
  ],
  OnlyLettersRule: [
    'OnlyDigitsRule',
    'EmailRule',
    'SpecialCharacterRule'
  ]
}

const DISABLED_RULES = {
  OnlyDigitsRule: [
    'EmailRule',
    'SpecialCharacterRule',
    'UppercaseRule',
    'LowercaseRule'
  ],
  OnlyLettersRule: [
    'EmailRule',
    'SpecialCharacterRule'
  ]
}

const RULES_BY_FIELD_TYPE = {
  text: AVAILABLE_VALIDATION_RULES.map(rule => rule.value),
  textarea: AVAILABLE_VALIDATION_RULES.map(rule => rule.value),
  password: [
    'OnlyLettersRule',
    'OnlyDigitsRule',
    'UppercaseRule',
    'LowercaseRule',
    'SpecialCharacterRule',
    'NoCodeOrLinksRule'
  ],
  number: ['OnlyDigitsRule'],
  email: ['EmailRule'],
  tel: [],
  url: [],
  checkbox: [],
  date: [],

}

/**
 * Creates the form editor interface.
 * 
 * The editor displays configured fields and lets users add fields.
 * Form data is managed by the supplied form model.
 * 
 * @param {object} formModel - The model that manages the form fields.
 * @returns {void}
 */
export function createFieldEditor(formModel, onFieldsChange = () => { }) {
  const editor = document.querySelector('#field-editor')

  if (!editor) {
    throw new Error('The field editor container was not found.')
  }

  const errorMessage = document.createElement('p')
  errorMessage.setAttribute('role', 'alert')
  errorMessage.hidden = true
  editor.before(errorMessage)

  /**
   * Displays an error message to the user.
   * 
   * @param {string} message - The message to display.
   * @returns {void}
   */
  function showError(message) {
    errorMessage.textContent = message
    errorMessage.hidden = false
  }

  /**
   * Updates a field, refreshes the editor and handles errors.
   * 
   * @param {string} fieldId - The ID of the field to update.
   * @param {object} changes - The properties to update.
   * @returns {void}
   */
  function updateField(fieldId, changes) {
    try {
      formModel.updateField(fieldId, changes)
      render()
      onFieldsChange()
    } catch (error) {
      render()
      showError(error.message)
    }
  }

  /**
   * Creates an input for editing a field label.
   * 
   * @param {object} field - The field to edit.
   * @returns {HTMLInputElement}
   */
  function createLabelInput(field) {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = field.label
    input.setAttribute(
      'aria-label',
      `Field label for ${field.label}`
    )

    input.addEventListener('change', () => {
      updateField(field.id, { label: input.value })
    })

    return input
  }

  /**
   * Creates a select element for choosing a field type.
   * 
   * @param {object} field - The field to edit.
   * @returns {HTMLSelectElement}
   */
  function createTypeSelect(field) {
    const select = document.createElement('select')
    select.setAttribute(
      'aria-label',
      `Field type for ${field.label}`
    )

    ALLOWED_FIELD_TYPES.forEach(type => {
      const option = document.createElement('option')
      option.value = type
      option.textContent = type
      select.append(option)
    })

    select.value = field.type

    select.addEventListener('change', () => {
      const allowedRules = RULES_BY_FIELD_TYPE[select.value] ?? []
      const validationRules = field.validationRules.filter(
        rule => allowedRules.includes(rule)
      )

      updateField(field.id, {
        type: select.value,
        validationRules
      })
    })

    return select
  }

  /**
   * Creates a checkbox element for setting whether a field is required.
   * 
   * @param {object} field - The field to edit.
   * @returns {HTMLLabelElement}
   */
  function createRequiredCheckbox(field) {
    const label = document.createElement('label')
    const checkbox = document.createElement('input')

    checkbox.type = 'checkbox'
    checkbox.checked = field.required
    checkbox.setAttribute(
      'aria-label',
      `Required field: ${field.label}`
    )

    label.append(
      checkbox,
      document.createTextNode(' Required')
    )

    checkbox.addEventListener('change', () => {
      updateField(field.id, { required: checkbox.checked })
    })

    return label
  }

  /**
   * Creates a button for removing a field.
   * 
   * @param {object} field - The field to remove.
   * @returns {HTMLButtonElement}
  */
  function createRemoveButton(field) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Remove'
    button.setAttribute(
      'aria-label',
      `Remove field ${field.label}`
    )

    button.addEventListener('click', () => {
      formModel.removeField(field.id)
      render()
      onFieldsChange()
    })

    return button
  }

  /**
   * Creates checkboxes for selecting validation rules.
   * 
   * @param {object} field - The field to configure.
   * @returns {HTMLFieldSetElement}
   */
  function createValidationRules(field) {
    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')
    legend.textContent = 'Validation rules'
    fieldset.append(legend)

    const allowedRules = RULES_BY_FIELD_TYPE[field.type] ?? []
    fieldset.disabled = allowedRules.length === 0

    AVAILABLE_VALIDATION_RULES.forEach(rule => {
      const label = document.createElement('label')
      const checkbox = document.createElement('input')

      checkbox.type = 'checkbox'
      checkbox.value = rule.value
      checkbox.checked = field.validationRules.includes(rule.value)

      checkbox.disabled = !allowedRules.includes(rule.value) ||
        field.validationRules.some(
        selectedRule => DISABLED_RULES[selectedRule]?.includes(rule.value)
      )

      checkbox.setAttribute(
        'aria-label',
        `${rule.label} for ${field.label}`
      )

      label.append(
        checkbox,
        document.createTextNode(` ${rule.label}`)
      )

      checkbox.addEventListener('change', () => {
        let validationRules = field.validationRules.filter(
          existingRule => existingRule !== rule.value
        )

        if (checkbox.checked) {
          validationRules = validationRules.filter(
            existingRule => !RULE_CONFLICTS[rule.value]?.includes(existingRule)
          )

          validationRules.push(rule.value)
        }

        updateField(field.id, { validationRules })
      })

      fieldset.append(label)
    })

    return fieldset
  }

  /**
   * Creates a new field with default settings.
   * 
   * @returns {void}
   */
  function addField() {
    const field = {
      id: crypto.randomUUID(),
      label: 'New field',
      type: 'text',
      required: false,
      validationRules: []
    }

    formModel.addField(field)
    render()
    onFieldsChange()
  }

  /**
   * Renders the current fields or an empty-state message,
   * and provides a button for adding a field.
   * 
   * @returns {void}
   */
  function render() {
    errorMessage.hidden = true
    errorMessage.textContent = ''

    const fields = formModel.getFields()
    editor.replaceChildren()

    if (fields.length === 0) {
      const message = document.createElement('p')
      message.textContent = 'No fields added yet.'
      editor.append(message)
    } else {
      const list = document.createElement('ul')

      fields.forEach(field => {
        const item = document.createElement('li')

        item.append(
          createLabelInput(field),
          createTypeSelect(field),
          createRequiredCheckbox(field),
          createRemoveButton(field),
          createValidationRules(field)
        )

        list.append(item)
      })

      editor.append(list)
    }

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.textContent = 'Add field'
    addButton.addEventListener('click', addField)

    editor.append(addButton)
  }

  render()
}
