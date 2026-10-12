import './styles/main.css'
import { createFormModel } from './state/form-model.js'
import { createFieldEditor } from './ui/field-editor.js'

const formModel = createFormModel()

createFieldEditor(formModel)
