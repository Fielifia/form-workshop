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
