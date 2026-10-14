import assert from 'node:assert/strict'
import test from 'node:test'
import { createFormModel } from '../src/state/form-model.js'

console.log(`\n===== FORM MODEL TESTS =====`)

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

test('supports parameterized validation rules', () => {
  const form = createFormModel()

  form.addField({
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validationRules: [
      { name: 'MinLengthRule', value: 8 },
      { name: 'MaxLengthRule', value: 50 }
    ]
  })

  assert.deepEqual(
    form.getFields()[0].validationRules,
    [
      { name: 'MinLengthRule', value: 8 },
      { name: 'MaxLengthRule', value: 50 }
    ]
  )
})

test('reject invalid length rule parameters', () => {
  const form = createFormModel()

  assert.throws(() => {
    form.addField({
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: [
        { name: 'MinLengthRule', value: -1 },
      ]
    })
  }, TypeError)
})

test('returns copies of parameterized validation rules', () => {
  const form = createFormModel()

  form.addField({
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validationRules: [
      { name: 'MinLengthRule', value: 8 },
    ]
  })

  const fields = form.getFields()
  fields[0].validationRules[0].value = 2

  assert.equal(
    form.getFields()[0].validationRules[0].value,
    8
  )
})

test('stores field validation rules independently', () => {
  const form = createFormModel()
  const rules = ['email']
  form.addField(makeField({ validationRules: rules }))

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

test('updates a field without changing its ID', () => {
  const form = createFormModel()
  form.addField(makeField())

  assert.equal(
    form.updateField('email-field', {
      label: 'Contact email',
      required: false
    }),
    true
  )

  assert.deepEqual(form.getFields(), [
    makeField({
      label: 'Contact email',
      required: false
    })
  ])
})

test('returns false when updating a missing field', () => {
  const form = createFormModel()

  assert.equal(form.updateField('missing', { label: 'New label' }),
    false
  )
})

test('preserves the field when an update is invalid', () => {
  const form = createFormModel()
  form.addField(makeField())

  assert.throws(
    () => form.updateField('email-field', { label: '' }),
    /non-empty label/
  )

  assert.deepEqual(form.getFields(), [makeField()])
})
