import assert from 'node:assert/strict'
import { test, beforeEach, afterEach } from 'node:test'
import { JSDOM } from 'jsdom'
import { createFormModel } from '../src/state/form-model.js'
import { createFormPreview } from '../src/ui/form-preview.js'

console.log(`\n===== FORM PREVIEW TESTS =====`)

let dom
let formModel

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
    <div id="form-preview"></div>
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

function createPreview() {
  createFormPreview(formModel)
  return document.querySelector('#form-preview')
}

test('displays a message when no fields exists', () => {
  const preview = createPreview()

  assert.equal(
    preview.querySelector('p').textContent,
      'Add fields to preview your form.'
  )
})

test('displays password strength while typing', () => {
  formModel.addField({
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validationRules: []
  })

  const preview = createPreview()
  const input = preview.querySelector('input[type="password"]')

  input.value = 'abc'
  input.dispatchEvent(new dom.window.Event('input'))

  const passwordFeedback = preview.querySelector('.password-feedback')

  assert.equal(passwordFeedback.hidden, false)
  assert.match(passwordFeedback.textContent, /Strength:/)
  assert.match(passwordFeedback.textContent, /Suggestions:/)
})
