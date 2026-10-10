import assert from 'node:assert/strict'
import test from 'node:test'
import { createFormModel } from '../src/state/form-config.js'

function makeField(overrides = {}) {
  return {
    id: 'email-field',
    label: 'Email',
    type: 'email',
    required: true,
    validationRules: ['email'],
    ...overrides
  }
}

test('starts with an empty form', () => {
  const form = createFormModel()

  assert.deepEqual(form.getFields(), [])
})
