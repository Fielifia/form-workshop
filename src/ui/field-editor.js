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

const PARAMETERIZED_RULES = [
  { value: 'MinLengthRule', label: 'Minimum length' },
  { value: 'MaxLengthRule', label: 'Maximum length' },
  { value: 'MatchingFieldsRule', label: 'Match another field' }
]

const FIELD_RULES = {
  text: {
    validation: AVAILABLE_VALIDATION_RULES.map(rule => rule.value),
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  textarea: {
    validation: AVAILABLE_VALIDATION_RULES.map(rule => rule.value),
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  password: {
    validation: [],
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  number: {
    validation: ['OnlyDigitsRule'],
    parameterized: []
  },
  email: {
    validation: ['EmailRule'],
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  tel: {
    validation: ['OnlyDigitsRule'],
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  url: {
    validation: [],
    parameterized: PARAMETERIZED_RULES.map(rule => rule.value)
  },
  checkbox: {
    validation: [],
    parameterized: []
  },
  date: {
    validation: [],
    parameterized: []
  }
}

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

const PASSWORD_REQUIRED_RULES = [
  'UppercaseRule',
  'LowercaseRule',
  'SpecialCharacterRule'
]

const PASSWORD_MIN_LENGTH = 10

/**
 * Returns the name of a validation rule.
 * 
 * Supports both simple string rules and parameterized rule objects.
 *
 * @param {string | {name: string, value: *}} rule - The validation rule.
 * @return {string}  The rule name.
 */
function getRuleName(rule) {
  return typeof rule === 'string' ? rule : rule.name
}

/**
 * Returns the rules supported by a field type.
 * 
 * @param {string} fieldType - The type of field.
 * @returns {{validation: string[], parameterized: string[]}}
 * The available validation and parameterized rule names.
 */
function getFieldRules(fieldType) {
  return FIELD_RULES[fieldType] ?? {
    validation: [],
    parameterized: []
  }
}

/**
 * Creates a DOM element with a text label.
 * 
 * @param {string} text - The text to display
 * @returns {HTMLLabelElement} The created label element
 */
function createLabel(text) {
  const label = document.createElement('label')
  label.append(document.createTextNode(text))
  return label
}

/**
 * Creates the form editor interface.
 * 
 * The editor displays configured fields and lets users add fields.
 * Form data is managed by the supplied form model.
 * 
 * @param {object} formModel - The model that manages the form fields.
 * @param {Function} onFieldsChange - Callback invoked when fields change.
 * @returns {void}
 */
export function createFieldEditor(
  formModel,
  onFieldsChange = () => { }
) {
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
   * Updates a field and refreshes the editor.
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
      const fieldType = select.value
      const rules = getFieldRules(fieldType)

      const validationRules = field.validationRules.filter(rule => {
        const ruleName = getRuleName(rule)

        return rules.validation.includes(ruleName) ||
          rules.parameterized.includes(ruleName)
      })

      updateField(field.id, {
        type: fieldType,
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

    const rules = getFieldRules(field.type)

    if (rules.validation.length === 0) {
      return null
    }

    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')

    legend.textContent = 'Validation rules'
    fieldset.append(legend)

    const isPassword = field.type === 'password'

    AVAILABLE_VALIDATION_RULES
      .filter(rule => rules.validation.includes(rule.value))
      .forEach(rule => {
        const label = document.createElement('label')
        const checkbox = document.createElement('input')

        checkbox.type = 'checkbox'
        checkbox.value = rule.value

        const isPasswordRequiredRule =
          isPassword && PASSWORD_REQUIRED_RULES.includes(rule.value)

        checkbox.checked = isPasswordRequiredRule ||
          field.validationRules.some(
            selectedRule => getRuleName(selectedRule) === rule.value)

        checkbox.disabled = isPasswordRequiredRule ||
          !rules.validation.includes(rule.value) ||
          field.validationRules.some(selectedRule => {
            const selectedRuleName = getRuleName(selectedRule)

            return DISABLED_RULES[selectedRuleName]?.includes(rule.value)
          }
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
            selectedRule => getRuleName(selectedRule) !== rule.value
          )

          if (checkbox.checked) {
            validationRules = validationRules.filter(selectedRule => {
              const selectedRuleName = getRuleName(selectedRule)

              return !RULE_CONFLICTS[rule.value]?.includes(selectedRuleName)
            }
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
   * Creates an input for a minimum or maximum length rule.
   * 
   * Password fields must have a minimum length of PASSWORD_MIN_LENGTH.
   * 
   * @param {object} field - The field to configure.
   * @param {object} rule - The rule configuration.
   * @param {object | undefined} existingRule -
   * The currently configured rule, if one exists.
   * @returns {HTMLLabelElement} The label containing the numeric input.
   */
  function createLengthRuleInput(field, rule, existingRule) {
    const label = createLabel(`${rule.label}: `)
    const input = document.createElement('input')

    input.type = 'number'
    input.min = '0'
    input.step = '1'

    const isPasswordMinLength =
      field.type === 'password' &&
      rule.value === 'MinLengthRule'

    const defaultValue = isPasswordMinLength
      ? PASSWORD_MIN_LENGTH
      : ''

    input.value = existingRule ? existingRule.value : defaultValue
    input.setAttribute(
      'aria-label',
      `${rule.label} for ${field.label}`
    )

    function getLengthRuleValue(ruleName) {
      const configuredRule = field.validationRules.find(
        configuredRule => getRuleName(configuredRule) === ruleName
      )

      return configuredRule ? Number(configuredRule.value) : undefined
    }

    input.addEventListener('change', () => {
      if (input.value === '') {
        if (isPasswordMinLength) {
          showError(
            `Password minimum length must be at least ${PASSWORD_MIN_LENGTH}.`
          )
          input.value = existingRule
            ? existingRule.value
            : PASSWORD_MIN_LENGTH
          return
        }

        removeParameterizedRule(field, rule.value)

        return
      }

      const value = Number(input.value)
      const minimumAllowed = isPasswordMinLength
        ? PASSWORD_MIN_LENGTH
        : 0

      if (!Number.isInteger(value) ||
        value < minimumAllowed) {
        showError(
          `${rule.label} must be at least ${minimumAllowed}.`
        )

        input.value = existingRule
          ? existingRule.value
          : defaultValue

        return
      }

      const otherRuleName = rule.value === 'MinLengthRule'
        ? 'MaxLengthRule'
        : 'MinLengthRule'

      const otherValue = getLengthRuleValue(otherRuleName)

      if (
        otherValue !== undefined &&
        (
          rule.value === 'MinLengthRule' && value > otherValue ||
          rule.value === 'MaxLengthRule' && value < otherValue
        )
      ) {
        showError('Maximum length cannot be less than minimum length.')

        input.value = existingRule ? existingRule.value : defaultValue
        return
      }

      const validationRules = field.validationRules.filter(
        configuredRule => getRuleName(configuredRule) !== rule.value
      )

      validationRules.push({
        name: rule.value,
        value
      })

      updateField(field.id, { validationRules })
    })

    label.append(input)
    return label
  }

  /**
   * Creates a select element for choosing another field to match.
   * 
  * @param {object} field - The field to configure.
  * @param {object} rule - The rule configuration.
  * @param {object | undefined} existingRule -
  * The currently configured rule, if one exists.
  * @returns {HTMLLabelElement} The label containing the select element.
  */
  function createMatchingFieldsSelect(field, existingRule) {
    const label = createLabel('Match another field: ')
    const select = document.createElement('select')

    select.setAttribute(
      'aria-label',
      `Match another field for ${field.label}`
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
          getRuleName(configuredRule) !== 'MatchingFieldsRule'
      )

      const changes = { validationRules }

      if (select.value !== '') {
        validationRules.push({
          name: 'MatchingFieldsRule',
          value: select.value
        })

        const originalField = formModel.getFields().find(
          otherField => otherField.id === select.value
        )

        if (field.label === 'New field' && originalField) {
          changes.label = `Confirm ${originalField.label}`
        }
      }

      updateField(field.id, changes)
    })

    label.append(select)
    return label
  }

  /**
   * Removes a parameterized rule from a field.
   * 
   * @param {object} field - The field to configure.
   * @param {string} ruleName - The name of the rule to remove.
   * @returns {void}
   */
  function removeParameterizedRule(field, ruleName) {
    const validationRules = field.validationRules.filter(
      rule => getRuleName(rule) !== ruleName
    )

    updateField(field.id, { validationRules })
  }

  /**
   * Creates controls for configuring parameterized validation rules.
   * 
   * @param {object} field - The field to configure.
   * @returns {HTMLFieldSetElement} The fieldset containing the controls.
   */
  function createParameterizedValidationRules(field) {
    const rules = getFieldRules(field.type)

    if (rules.parameterized.length === 0) {
      return null
    }

    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')

    legend.textContent = 'Parameterized validation rules'
    fieldset.classList.add('parameterized-rules')
    fieldset.append(legend)

    const allowedRules = getFieldRules(field.type).parameterized

    PARAMETERIZED_RULES.forEach(rule => {
      if (!allowedRules.includes(rule.value)) {
        return
      }

      const existingRule = field.validationRules.find(
        configuredRule => getRuleName(configuredRule) === rule.value
      )

      if (
        rule.value === 'MinLengthRule' ||
        rule.value === 'MaxLengthRule'
      ) {
        fieldset.append(
          createLengthRuleInput(field, rule, existingRule)
        )
      } else if (rule.value === 'MatchingFieldsRule') {
        fieldset.append(
          createMatchingFieldsSelect(field, existingRule)
        )
      }
    })

    return fieldset
  }

  /**
   * Creates a list of the fixed password requirements.
   * 
   * Actual password validation is handled by the password module.
   * 
   * @returns {HTMLFieldSetElement} The fieldset displaying the requirements.
   */
  function createPasswordRequirements() {
    const fieldset = document.createElement('fieldset')
    const legend = document.createElement('legend')

    fieldset.classList.add('password-requirements')
    legend.textContent = 'Password requirements'

    const requirements = [
      'At least 10 characters.',
      'Include an uppercase letter.',
      'Include a lowercase letter.',
      'Include a number.',
      'Include an allowed special character.',
      'No spaces.'
    ]

    fieldset.append(legend)

    requirements.forEach(requirement => {
      const paragraph = document.createElement('p')
      paragraph.textContent = requirement
      fieldset.append(paragraph)
    })

    return fieldset
  }

  /**
   * Creates and adds a new text field, then refreshes the editor.
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
   * Renders the configured fields and the button for adding a field.
   * 
   * Displays an empty-state message when no fields exist.
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

        const isMatchingField = Boolean(field.matchingFieldId)

        const matchingRule = isMatchingField
          ? { name: 'MatchingFieldsRule', value: field.matchingFieldId }
          : undefined

        item.append(
          createLabelInput(field)
        )

        if (!isMatchingField) {
          item.append(
            createTypeSelect(field),
            createRequiredCheckbox(field)
          )
        }

        item.append(createRemoveButton(field))

        if (!isMatchingField && field.type === 'password') {
          item.append(createPasswordRequirements())
        }

        if (isMatchingField) {
          item.append(
            createMatchingFieldsSelect(field, matchingRule)
          )
        } else {
          const parameterizedValidationRules =
            createParameterizedValidationRules(field)

          if (parameterizedValidationRules) {
            item.append(parameterizedValidationRules)
          }

          const validationRules = createValidationRules(field)

          if (validationRules) {
            item.append(validationRules)
          }
        }

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
