import { validateForm } from '../services/validation-service.js'
import { evaluatePassword } from '../services/password-service.js'
import { getFieldRequirements } from '../services/requirement-service.js'

/**
 * Creates an input element for a configured field.
 * 
 * @param {object} field - The configured form field.
 * @returns {HTMLElement|HTMLTextAreaElement} The input element.
 */
function createInput(field) {
  const input = field.type === 'textarea'
    ? document.createElement('textarea')
    : document.createElement('input')

  if (field.type !== 'textarea') {
    input.type = field.type
  }

  input.id = field.id
  input.name = field.id
  input.required = field.required

  return input
}

/**
 * Creates a field label including the required indicator.
 * 
 * @param {object} field - The configured form field.
 * @returns {HTMLLabelElement} The field label.
 */
function createLabel(field) {
  const label = document.createElement('label')
  label.htmlFor = field.id
  label.textContent = field.label

  if (field.required) {
    const required = document.createElement('span')
    required.textContent = ' *'
    required.setAttribute('aria-label', 'required')
    label.append(required)
  }

  return label
}

/**
 * Creates a list of field requirements.
 * 
 * @param {object} field - The configured form field.
 * @returns {HTMLListElement|null} The requirement list.
 */
function createRequirementList(field, fields) {
  const requirements = getFieldRequirements(field, fields)

  if (requirements.length === 0) {
    return null
  }

  const fieldset = document.createElement('fieldset')
  fieldset.className = 'field-requirements'

  const legend = document.createElement('legend')
  legend.textContent = 'Requirements'
  fieldset.append(legend)

  requirements.forEach(requirement => {
    const paragraph = document.createElement('p')
    paragraph.textContent = requirement
    fieldset.append(paragraph)
  })

  return fieldset
}

/**
 * Create an error element for a field.
 * 
 * @param {object} field - The configured form field.
 * @returns {HTMLParagraphElement} The error element.
 */
function createErrorElement(field) {
  const error = document.createElement('p')
  error.className = 'field-error'
  error.id = `${field.id}-error`
  error.hidden = true

  return error
}

/**
 * Updates the password strength and suggestions.
 * 
 * @param {HTMLIputElement} input - The password input.
 * @param {HTMLDivElement} feedback - The password feedback container.
 * @returns {void}
 */
function updatePasswordFeedback(input, feedback) {
  feedback.replaceChildren()

  if (input.value.length === 0) {
    feedback.hidden = true
    return
  }

  const result = evaluatePassword(input.value)
  feedback.hidden = false

  const strength = document.createElement('p')
  strength.textContent = `Strength: ${result.strength} (${result.score}/5)`
  feedback.append(strength)


  if (result.suggestions.length === 0) {
    return
  }

  const heading = document.createElement('p')
  heading.textContent = 'Suggestions:'

  const list = document.createElement('ul')

  result.suggestions.forEach(suggestion => {
    const item = document.createElement('li')
    item.textContent = suggestion
    list.append(item)
  })

  feedback.append(heading, list)
}

/**
 * Create password feedback and connects it to the input.
 * 
 * @param {HTMLInputElement} input - The password input.
 * @param {HTMLElement} group - The field container.
 * @returns {void}
 */
function setupPasswordFeedback(input, group) {
  const feedback = document.createElement('div')
  feedback.className = 'password-feedback'
  feedback.setAttribute('aria-live', 'polite')
  feedback.hidden = true

  group.append(feedback)

  input.addEventListener('input', () => {
    updatePasswordFeedback(input, feedback)

  })
}

/**
 * Validates the form and ands password-specific validation errors.
 * 
 * @param {Array<object>} fields - The configured form fields.
 * @param {object} values - The submitted form values.
 * @returns {{valid: boolean, errors: Array<object>}} The validation result.
 */
function validatePreviewForm(fields, values) {
  const result = validateForm(fields, values)

  const passwordErrors = fields.flatMap(field => {
    if (field.type !== 'password' || !values[field.id]) {
      return []
    }

    const passwordResult = evaluatePassword(values[field.id])

    if (passwordResult.valid) {
      return []
    }

    const suggestions = passwordResult.suggestions.join('. ')


    return [{
      fieldId: field.id,
      message: `Password does not meet the requirements. ${suggestions}`
    }]
  })

  const errors = [...result.errors, ...passwordErrors]

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Displays validation errors on the corresponding fields.
 * 
 * @param {Array<object>} fields . The configured form fields.
 * @param {HTMLFormElement} form - The preview form.
 * @param {Map<string, HTML Element>} errorElements - Field error elements.
 * @param {Array<object>} errors - The validation errors.
 * @returns {void}
 */
function displayFieldErrors(fields, form, errorElements, errors) {
  fields.forEach(field => {
    const input = form.elements.namedItem(field.id)
    const error = errorElements.get(field.id)

    const fieldErrors = errors.filter(
      item => item.fieldId === field.id
    )

    error.replaceChildren()
    error.hidden = fieldErrors.length === 0

    if (fieldErrors.length > 0) {
      error.textContent = fieldErrors
        .map(item => item.message)
        .join(' ')

      input.setAttribute('aria-invalid', 'true')
    } else {
      input.removeAttribute('aria-invalid')
    }
  })
}

/**
 * Creates a form preview  based on the configured form fields.
 * 
 * @param {object} formModel - The model that manages the form fields.
 * @returns {{render: Function}} The preview render function.
 */
export function createFormPreview(formModel) {
  const preview = document.querySelector('#form-preview')

  if (!preview) {
    throw new Error('The form preview container was not found.')
  }

  /**
   * Renders the configured fields and validation feedback.
   * 
   * @returns {void}
   */
  function render() {
    preview.replaceChildren()

    const fields = formModel.getFields()

    if (fields.length === 0) {
      const message = document.createElement('p')
      message.textContent = 'Add fields to preview your form.'
      preview.append(message)
      return
    }

    const form = document.createElement('form')
    form.noValidate = true

    const feedback = document.createElement('div')
    feedback.setAttribute('aria-live', 'polite')

    const errorElements = new Map()

    fields.forEach(field => {
      const group = document.createElement('div')
      group.className = 'preview-field'

      const label = createLabel(field)
      const input = createInput(field)
      const requirementList = createRequirementList(field, fields)
      const error = createErrorElement(field)

      input.setAttribute('aria-describedby', error.id)
      errorElements.set(field.id, error)

      group.append(label, input)

      if (requirementList) {
        group.append(requirementList)
      }

      group.append(error)

      if (field.type === 'password') {
        setupPasswordFeedback(input, group)
      }

      form.append(group)
    })

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.textContent = 'Validate form'

    form.append(submitButton, feedback)

    form.addEventListener('submit', event => {
      event.preventDefault()

      const values = {}

      fields.forEach(field => {
        const input = form.elements.namedItem(field.id)

        values[field.id] = field.type === 'checkbox'
          ? input.checked
          : input.value
      })

      const result = validatePreviewForm(fields, values)
      displayFieldErrors(
        fields,
        form,
        errorElements,
        result.errors
      )

      feedback.className = result.valid
        ? 'validation-feedback validation-success'
        : 'validation-feedback validation-error'

      feedback.textContent = result.valid
        ? 'The form is valid'
        : 'Please correct the errors above.'
    })

    preview.append(form)
  }

  render()

  return {
    render
  }
}
