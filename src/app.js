import './styles/main.css'
import { createFormModel } from './state/form-model.js'
import { createFieldEditor } from './ui/field-editor.js'
import { createFormPreview } from './ui/form-preview.js'

const formModel = createFormModel()

const formPreview = createFormPreview(formModel)

createFieldEditor(formModel, () => {
  formPreview.render()
})
