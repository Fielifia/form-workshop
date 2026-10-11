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
}
