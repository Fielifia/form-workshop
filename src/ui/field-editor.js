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
  password: [],
  number: ['OnlyDigitsRule'],
  email: ['EmailRule'],
  tel: [],
  url: [],
  checkbox: [],
  date: [],
}


const PARAMETERIZED_RULES = [
  { value: 'MinLengthRule', label: 'Minimum length' },
  { value: 'MaxLengthRule', label: 'Maximum length' },
  { value: 'MatchingFieldsRule', label: 'Match another field' }
]

const PARAMETERIZED_RULES_BY_FIELD_TYPE = {
  text: PARAMETERIZED_RULES.map(rule => rule.value),
  textarea: PARAMETERIZED_RULES.map(rule => rule.value),
  password: PARAMETERIZED_RULES.map(rule => rule.value),
  email: PARAMETERIZED_RULES.map(rule => rule.value),
  tel: PARAMETERIZED_RULES.map(rule => rule.value),
  url: PARAMETERIZED_RULES.map(rule => rule.value),
  number: [],
  checkbox: [],
  date: []
}

/**
 *
 *
 * @param {*} rule
 * @return {*} 
 */
function getRuleName(rule) {
  return typeof rule === 'string' ? rule : rule.name
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

      const parameterizedRules =
        PARAMETERIZED_RULES_BY_FIELD_TYPE[select.value] ?? []

      const validationRules = field.validationRules.filter(
        rule => {
          const ruleName = getRuleName(rule)

          return allowedRules.includes(ruleName) ||
            parameterizedRules.includes(ruleName)
        })

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

    const isPassword = field.type === 'password'

    const passwordRequiredRules = [
      'UppercaseRule',
      'LowercaseRule',
      'SpecialCharacterRule'
    ]

    const allowedRules = RULES_BY_FIELD_TYPE[field.type] ?? []
    fieldset.disabled = allowedRules.length === 0

    AVAILABLE_VALIDATION_RULES.forEach(rule => {
      const label = document.createElement('label')
      const checkbox = document.createElement('input')

      checkbox.type = 'checkbox'
      checkbox.value = rule.value

      const isPasswordRequiredRule =
        isPassword && passwordRequiredRules.includes(rule.value)

      checkbox.checked = isPasswordRequiredRule ||
        field.validationRules.some(
          selectedRule => getRuleName(selectedRule) === rule.value)

      checkbox.disabled = isPasswordRequiredRule ||
        !allowedRules.includes(rule.value) ||
        field.validationRules.some(
          selectedRule =>
            DISABLED_RULES[getRuleName(selectedRule)]?.includes(rule.value)
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
   * Creates controls for validation rules that require a value.
   * 
   * @param {object} field - The field to configure.
   * @returns {HTMLFieldElement}
   */
  function createParameterizedValidationRules(field) {
    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')
    
    legend.textContent = 'Parameterized validation rules'
    fieldset.classList.add('parameterized-rules')
    fieldset.append(legend)

    const allowedRules =
      PARAMETERIZED_RULES_BY_FIELD_TYPE[field.type] ?? []

    PARAMETERIZED_RULES.forEach(rule => {
      if (!allowedRules.includes(rule.value)) {
        return
      }

      const existingRule = field.validationRules.find(
        configuredRule => getRuleName(configuredRule) === rule.value
      )

      const label = document.createElement('label')
      label.append(document.createTextNode(`${rule.label}: `))

      if (
        rule.value === 'MinLengthRule' ||
        rule.value === 'MaxLengthRule'
      ) {
        const input = document.createElement('input')
        input.type = 'number'
        input.min = '0'
        input.step = '1'

        const isPasswordMinLength =
          field.type === 'password' &&
          rule.value === 'MinLengthRule'

        input.value = existingRule
          ? existingRule.value
          : isPasswordMinLength
            ? 10
            : ''

        input.setAttribute('aria-label', `${rule.label} for ${field.label}`)

        input.addEventListener('change', () => {
          if (input.value === '') {
            if (isPasswordMinLength) {
              showError('Password minimum length cannot be lower than 10.')
              input.value = existingRule ? existingRule.value : 10
              return
            }

            updateField(field.id, {
              validationRules: field.validationRules.filter(
                configuredRule =>
                  getRuleName(configuredRule) !== rule.value
              )
            })

            return
          }

          const value = Number(input.value)
          const minimumAllowed = isPasswordMinLength ? 10 : 0

          if (!Number.isInteger(value) ||
            value < minimumAllowed) {
            showError(
              `${rule.label} must be at least ${minimumAllowed}.`
            )
            input.value = existingRule
              ? existingRule.value
              : isPasswordMinLength
                ? 10
                : 0
            return
          }

          const validationRules = field.validationRules.filter(
            configuredRule =>
              getRuleName(configuredRule) !== rule.value
          )

          validationRules.push({
            name: rule.value,
            value
          })

          updateField(field.id, { validationRules })
        })

        label.append(input)
      } else if (rule.value === 'MatchingFieldsRule') {
        const select = document.createElement('select')
        select.setAttribute(
          'aria-label',
          `${rule.label} for ${field.label}`
        )

        const emptyOption = document.createElement('option')
        emptyOption.value = ''
        emptyOption.textContent = 'Do not match another field'
        select.append(emptyOption)

        formModel.getFields()
          .filter(otherField => otherField.id !== field.id)
          .forEach(otherField => {
            const option = document.createElement('option')
            option.value = otherField.id
            option.textContent = otherField.label
            select.append(option)
          })

        select.value = existingRule ? existingRule.value : ''

        select.addEventListener('change', () => {
          const validationRules = field.validationRules.filter(
            configuredRule =>
              getRuleName(configuredRule) !== rule.value
          )

          if (select.value !== '') {
            validationRules.push({
              name: rule.value,
              value: select.value
            })
          }

          updateField(field.id, { validationRules })
        })

        label.append(select)
      }

      fieldset.append(label)
    })

    return fieldset
  }

  function createPasswordRequirements() {
    const fieldset = document.createElement('fieldset')
    fieldset.classList.add('password-requirements')
    const legend = document.createElement('legend')
    legend.textContent = 'Password requirements'

    const requirements = [
      '10 characters',
      'One uppercase letter',
      'One lowercase letter',
      'One number',
      'One special character',
      'No spaces'
    ]

    fieldset.append(legend)

    requirements.forEach(requirement => {
      const paragraph = document.createElement('p')
      paragraph.textContent = `🔒 ${requirement}`
      fieldset.append(paragraph)
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
          createParameterizedValidationRules(field),
        )
        if (field.type === 'password') {
          item.append(createPasswordRequirements())
        }

        item.append(createValidationRules(field))

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
