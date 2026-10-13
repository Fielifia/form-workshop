import { validateForm } from '../services/validation-service.js'

/**
 * Creates a form preview  based on the configured form fields.
 * 
 * @param {object} formModel - The model that manages the form fields.
 * @returns {void}
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

      const label = document.createElement('label')
      label.htmlFor = field.id
      label.textContent = field.label

      if (field.required) {
        const required = document.createElement('span')
        required.textContent = ' *'
        required.setAttribute('aria-label', 'required')
        label.append(required)
      }

      let input

      if (field.type === 'textarea') {
        input = document.createElement('textarea')
      } else {
        input = document.createElement('input')
        input.type = field.type === 'checkbox'
          ? 'checkbox'
          : field.type
      }

      input.id = field.id
      input.name = field.id
      input.required = field.required

      if (field.type === 'checkbox') {
        label.htmlFor = field.id
        group.append(label, input)
      } else {
        group.append(label, input)
      }

      const error = document.createElement('p')
      error.className = 'field-error'
      error.id = `${field.id}-error`
      error.hidden = true

      input.setAttribute('aria-describedby', error.id)
      errorElements.set(field.id, error)

      group.append(error)
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

      const result = validateForm(fields, values)

      fields.forEach(field => {
        const input = form.elements.namedItem(field.id)
        const error = errorElements.get(field.id)

        const fieldErrors = result.errors.filter(
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

      feedback.textContent = result.valid
        ? 'The form is valid'
        : 'Please correct the errors above.'

      feedback.className = result.valid
        ? 'validation-success'
        : 'validation-error'
    })

    preview.append(form)
  }

  render()

  return {
    render
  }
}
