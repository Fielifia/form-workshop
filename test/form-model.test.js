import assert from 'node:assert/strict'
import test from 'node:test'
import { createFormModel } from '../src/state/form-model.js'

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

test('rejects duplicate field IDs', () => {
  const form = createFormModel()
  form.addField(makeField())

  assert.throws(
    () => form.addField(makeField()),
    /already exists/
  )
})

test('supports optional fields', () => {
  const form = createFormModel()
  const field = makeField({ required: false })

  form.addField(field)

  assert.equal(form.getFields()[0].required, false)
})

test('stores field validation rules independently', () => {
  const form = createFormModel()
  const rules = ['email']
  form.addField(makeField({ ValidationRules: rules }))

  rules.push('required')

  assert.deepEqual(
    form.getFields()[0].validationRules,
    ['email'])
})

test('rejects invalid field configurations', () => {
  const form = createFormModel()

  assert.throws(
    () => form.addField(makeField({ id: '' })),
    /non-empty string ID/
  )

  assert.throws(
    () => form.addField(makeField({ label: '' })),
    /non-empty label/
  )

  assert.throws(
    () => form.addField(makeField({ type: 'unknown' })),
    /Unsupported field type/
  )

  assert.throws(
    () => form.addField(makeField({ required: 'yes' })),
    /must be a boolean/
  )

  assert.throws(
    () => form.addField(makeField({ validationRules: 'email' })),
    /must be an array/
  )

  assert.deepEqual(form.getFields(), [])
})
