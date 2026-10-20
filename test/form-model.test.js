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
    validationRules: ['EmailRule'],
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
  const rules = ['EmailRule']
  form.addField(makeField({ validationRules: rules }))

  rules.push('RequiredRule')

  assert.deepEqual(
    form.getFields()[0].validationRules,
    ['EmailRule'])
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
    () => form.addField(makeField({ validationRules: 'EmailRule' })),
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

test('matching field inherits type, required and validation rules', () => {
  const form = createFormModel()

  form.addField(makeField({
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validationRules: [
      { name: 'MinLengthRule', value: 12 },
      'UppercaseRule',
    ]
  }))

  form.addField(makeField({
    id: 'confirm-password',
    label: 'Confirm password',
    type: 'text',
    required: false,
    validationRules: [
      { name: 'MatchingFieldsRule', value: 'password' }
    ]
  }))

  const confirmation = form.getFields().find(
    field => field.id === 'confirm-password'
  )

  assert.equal(confirmation.type, 'password')
  assert.equal(confirmation.required, true)
  assert.deepEqual(confirmation.validationRules, [
    { name: 'MinLengthRule', value: 12 },
    'UppercaseRule'
  ])
})

test('matching field follows change to the original field', () => {
  const form = createFormModel()

  form.addField(makeField({
    id: 'original',
    type: 'text',
    required: false,
    validationRules: ['OnlyLettersRule']
  }))

  form.addField(makeField({
    id: 'confirmation',
    validationRules: [
      { name: 'MatchingFieldsRule', value: 'original' }
    ]
  }))

  form.updateField('original', {
    type: 'email',
    required: true,
    validationRules: ['EmailRule']
  })

  const confirmation = form.getFields().find(
    field => field.id === 'confirmation'
  )

  assert.equal(confirmation.type, 'email')
  assert.equal(confirmation.required, true)
  assert.deepEqual(confirmation.validationRules, ['EmailRule'])
})

test('removing the original field preserves inherited settings', () => {
  const form = createFormModel()

  form.addField(makeField({
    id: 'original',
    type: 'password',
    required: true,
    validationRules: [
      { name: 'MinLengthRule', value: 12 },
      'UppercaseRule'
    ]
  }))

  form.addField(makeField({
    id: 'confirmation',
    validationRules: [
      { name: 'MatchingFieldsRule', value: 'original' }
    ]
  }))

  form.removeField('original')

  const confirmation = form.getFields().find(
    field => field.id === 'confirmation'
  )

  assert.equal(confirmation.type, 'password')
  assert.equal(confirmation.required, true)
  assert.deepEqual(confirmation.validationRules, [
    { name: 'MinLengthRule', value: 12 },
    'UppercaseRule'
  ])
})


test('removing the original field clears the matching rule', () => {
  const form = createFormModel()

  form.addField(makeField({
    id: 'original',
  }))

  form.addField(makeField({
    id: 'confirmation',
    validationRules: [
      { name: 'MatchingFieldsRule', value: 'original' }
    ]
  }))

  form.removeField('original')

  const confirmation = form.getFields().find(
    field => field.id === 'confirmation'
  )

  assert.equal(confirmation.validationRules.some(
    rule => typeof rule === 'object' &&
      rule.name === 'MatchingFieldsRule'
  ), false
  )
})
