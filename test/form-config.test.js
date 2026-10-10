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

test('adds a field to the configuration', () => {
  const form = createFormModel()
  form.addField(makeField())

  assert.deepEqual(form.getFields(), [makeField()])
})

test('removes a field from the configuration', () => {
  const form = createFormModel()
  form.addField(makeField())

  assert.equal(form.removeField('email-field'), true)
  assert.deepEqual(form.getFields(), [])
})

test('returns false when removing a field that does not exist', () => {
  const form = createFormModel()

  assert.equal(form.removeField('missing'), false)
})
