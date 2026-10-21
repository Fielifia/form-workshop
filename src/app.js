import './styles/main.css'
import { createFormModel } from './state/form-model.js'
import { createFieldEditor } from './ui/field-editor.js'
import { createFormPreview } from './ui/form-preview.js'
import { generateHTML } from './services/export-service.js'

const formModel = createFormModel()

const formPreview = createFormPreview(formModel)

createFieldEditor(formModel, () => {
  formPreview.render()
})

const exportButton = document.querySelector('#export-form')
const exportFeedback = document.querySelector('#export-feedback')

exportButton.addEventListener('click', () => {
  try {
    const fields = formModel.getFields()
    const html = generateHTML(fields)
    
    const blob = new Blob([html], {
      type: 'text/html;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'form.html'

    document.body.append(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    exportFeedback.textContent = 'Form exported successfully.'
  } catch (error) {
    exportFeedback.textContent = 'Could not export the form.'
    console.error('Form export failed: ', error)
  }
})
