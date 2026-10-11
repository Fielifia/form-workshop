import { ALLOWED_FIELD_TYPES } from '../state/form-model.js'
/**
 * Creates the form editor interface.
 * 
 * The editor displays configured fields and lets users add fields.
 * Form data is managed by the supplied form model.
 * 
 * @param {object} formModel - The model that manages the form fields.
 * @returns {void}
 */
export function createFieldEditor(formModel) {
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

        const labelInput = document.createElement('input')
        labelInput.type = 'text'
        labelInput.value = field.label
        labelInput.setAttribute(
          'aria-label',
          `Field label for ${field.label}`
        )

        /**
         * Updates the field label in the model.
         * 
         * @returns {void}
         */
        labelInput.addEventListener('change', () => {
          try {
            formModel.updateField(field.id, {
              label: labelInput.value
            })
            render()
          } catch (error) {
            labelInput.value = field.label
            showError(error.message)
          }
        })

        const typeSelect = document.createElement('select')
        typeSelect.setAttribute(
          'aria-label',
          `Field type for ${field.label}`
        )

        ALLOWED_FIELD_TYPES.forEach(type => {
          const option = document.createElement('option')
          option.value = type
          option.textContent = type
          option.selected = type === field.type
          typeSelect.append(option)
        })

        /**
         * Updates the field type in the model.
         * 
         * @returns {void}
         */
        typeSelect.addEventListener('change', () => {
          try {
            formModel.updateField(field.id, {
              type: typeSelect.value
            })
            render()
          } catch (error) {
            showError(errorMessage)
            render()
          }
        })

        const removeButton = document.createElement('button')
        removeButton.type = 'button'
        removeButton.textContent = 'Remove'
        removeButton.setAttribute(
          'aria-label',
          `Remove field ${field.label}`
        )

        /**
         * Removes the selected field and refreshes the editor.
         * 
         * @returns{void}
         */
        removeButton.addEventListener('click', () => {
          formModel.removeField(field.id)
          render()
        })

        item.append(labelInput, typeSelect, removeButton)
        list.append(item)
      })

      editor.append(list)
    }

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.textContent = 'Add field'

    /**
     * Adds a new text field to the form model and refreshes the editor.
     * 
     * @returns {void}
     */
    addButton.addEventListener('click', () => {
      const field = {
        id: crypto.randomUUID(),
        label: 'New field',
        type: 'text',
        required: false,
        validationRules: []
      }

      formModel.addField(field)
      render()
    })

    editor.append(addButton)
  }

  render()
}
