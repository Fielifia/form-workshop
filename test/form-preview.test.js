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

test('hides password feedback when the password is cleared', () => {
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

  input.value = ''
  input.dispatchEvent(new dom.window.Event('input'))

  assert.equal(
    preview.querySelector('.password-feedback').hidden,
    true)
})

test('does not display password feedback for text fields', () => {
  formModel.addField({
    id: 'name',
    label: 'Name',
    type: 'text',
    required: false,
    validationRules: []
  })

  const preview = createPreview()

  assert.equal(
    preview.querySelector('.password-feedback'),
    null)
})

test('rejects a weak password when submitting the form', () => {
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

  preview.querySelector('form').dispatchEvent(
    new dom.window.Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )

  assert.equal(input.getAttribute('aria-invalid'), 'true')
  assert.equal(
    preview.querySelector('form > div[aria-live="polite"]:last-child').textContent,
    'Please correct the errors above.')
})

test('accepts a strong password when submitting the form', () => {
  formModel.addField({
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validationRules: []
  })

  const preview = createPreview()
  const input = preview.querySelector('input[type="password"]')

  input.value = 'myPassword123!'

  preview.querySelector('form').dispatchEvent(
    new dom.window.Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )

  assert.equal(input.hasAttribute('aria-invalid'), false)
  assert.equal(
    preview.querySelector('form > div[aria-live="polite"]:last-child').textContent,
    'The form is valid')
})

test('continues to accept valid text fields', () => {
  formModel.addField({
    id: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    validationRules: []
  })

  const preview = createPreview()
  const input = preview.querySelector('input[type="text"]')

  input.value = 'Name'

  preview.querySelector('form').dispatchEvent(
    new dom.window.Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )

  assert.equal(input.hasAttribute('aria-invalid'), false)
  assert.equal(
    preview.querySelector('form > div[aria-live="polite"]:last-child').textContent,
    'The form is valid')
})

test('displays an error for an invalid email address', () => {
  formModel.addField({
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validationRules: ['EmailRule']
  })

  const preview = createPreview()
  const input = preview.querySelector('#email')

  input.value = 'invalid-email'

  preview.querySelector('form').dispatchEvent(
    new dom.window.Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )

  assert.equal(input.getAttribute('aria-invalid'), 'true')
  assert.equal(
    preview.querySelector('#email-error').hidden,
    false
  )
})

test('clears validation errors after correcting the input', () => {
  formModel.addField({
    id: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    validationRules: []
  })

  const preview = createPreview()
  const input = preview.querySelector('#name')

  input.value = 'Name'

  preview.querySelector('form').dispatchEvent(
    new dom.window.Event('submit', {
      bubbles: true,
      cancelable: true
    })
  )

  assert.equal(input.hasAttribute('aria-invalid'), false)
  assert.equal(preview.querySelector('#name-error').hidden, true)
  assert.equal(
    preview.querySelector('[aria-live="polite"]').textContent,
    'The form is valid'
  )
})

test('renders updated field configuration', () => {
  formModel.addField({
    id: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    validationRules: []
  })

  const formPreview = createFormPreview(formModel)
  const preview = document.querySelector('#form-preview')

  assert.equal(
    preview.querySelector('label').textContent,
    'Name *')

  formModel.updateField('name', {
    label: 'Full name',
    required: false
  })

  formPreview.render()

  assert.equal(
    preview.querySelector('label').textContent,
    'Full name')

  assert.equal(
    preview.querySelector('input').required,
    false
  )
})
