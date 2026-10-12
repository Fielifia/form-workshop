import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createFormModel } from '../src/state/form-model.js'
import { createFieldEditor } from '../src/ui/field-editor.js'

let dom
let formModel

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
    <main>
    <div id="field-editor"></div>
    </main>
    </body>
    </html>
    `)

  globalThis.document = dom.window.document
  formModel = createFormModel()
})

afterEach(() => {
  dom.window.close()
  delete globalThis.document
})

/**
 * Creates the editor before each interaction test
 * 
 * @returns {HTMLElement} The editor container
*/
function createEditor() {
  createFieldEditor(formModel)
  return document.querySelector('#field-editor')
}

test('displays a message when no fields exists', () => {
  const editor = createEditor()

  assert.equal(
    editor.querySelector('p').textContent,
    'No fields added yet.'
  )
})

test('adds a field when the add button is clicked', () => {
  const editor = createEditor()

  editor.querySelector('button').click()

  assert.equal(formModel.getFields().length, 1)
  assert.equal(
    editor.querySelectorAll('li').length,
    1
  )
})

test('removes a field when the remove button is clicked', () => {
  formModel.addField({
    id: 'field-1',
    label: 'Email',
    type: 'email',
    required: false,
    validationRules: []
  })

  const editor = createEditor()

  editor.querySelector('button[aria-label="Remove field Email"]').click()

  assert.equal(formModel.getFields().length, 0)
  assert.equal(
    editor.querySelectorAll('li').length,
    0
  )
})

test('updated a field label when the input changes', () => {
  formModel.addField({
    id: 'field-1',
    label: 'Name',
    type: 'text',
    required: false,
    validationRules: []
  })

  const editor = createEditor()
  const input = editor.querySelector('input[type="text"]')

  input.value = 'Full name'
  input.dispatchEvent(new dom.window.Event('change'))

  assert.equal(formModel.getFields()[0].label, 'Full name')
})

test('updated a field type when the selection changes', () => {
  formModel.addField({
    id: 'field-1',
    label: 'Contact',
    type: 'text',
    required: false,
    validationRules: []
  })

  const editor = createEditor()
  const select = editor.querySelector('select')

  select.value = 'email'
  select.dispatchEvent(new dom.window.Event('change'))

  assert.equal(formModel.getFields()[0].type, 'email')
})

test('updated whether a field is required', () => {
  formModel.addField({
    id: 'field-1',
    label: 'Email',
    type: 'email',
    required: false,
    validationRules: []
  })

  const editor = createEditor()
  const checkbox = editor.querySelector('input[aria-label="Required field: Email"]')

  checkbox.checked = true
  checkbox.dispatchEvent(new dom.window.Event('change'))

  assert.equal(formModel.getFields()[0].required, true)
})
