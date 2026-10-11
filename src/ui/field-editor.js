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

  /**
   * Renders the current fields or an empty-state message,
   * and provides a button for adding a field.
   * 
   * @returns {void}
   */
  function render() {
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
        const label = document.createElement('span')

        label.textContent = `${field.label} (${field.type})`

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

        item.append(label, removeButton)
        list.append(item)
      })

      editor.append(list)
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Add field'

    /**
     * Adds a new text field to the form model and refreshes the editor.
     * 
     * @returns {void}
     */
    button.addEventListener('click', () => {
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

    editor.append(button)
  }

  render()
}
