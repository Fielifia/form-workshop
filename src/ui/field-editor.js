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
        item.textContent = `${field.label} (${field.type})`
        list.append(item)
      })

      editor.append(list)
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Add field'

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
