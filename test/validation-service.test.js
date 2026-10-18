import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateForm } from '../src/services/validation-service.js'

console.log(`\n===== VALIDATION SERVICE TESTS =====`)

test('accepts valid input', () => {
  const fields = [
    {
      id: 'email',
      label: 'EmailRule',
      type: 'email',
      required: true,
      validationRules: ['EmailRule']
    }
  ]

  const result = validateForm(fields, {
    email: 'name@example.com'
  })

  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
})

test('returns an error for an invalid email', () => {
  const fields = [
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validationRules: ['EmailRule']
    }
  ]

  const result = validateForm(fields, {
    email: 'not-an-email'
  })

  assert.equal(result.valid, false)
  assert.equal(result.errors.length, 1)
  assert.equal(result.errors[0].fieldId, 'email')
})

test('returns a required error for an empty required field', () => {
  const fields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      validationRules: []
    }
  ]

  const result = validateForm(fields, {
    name: ''
  })

  assert.equal(result.valid, false)
  assert.equal(result.errors[0].fieldId, 'name')
  assert.equal(result.errors[0].message, 'This field is required.')
})

test('accepts an empty optional field', () => {
  const fields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      validationRules: []
    }
  ]

  const result = validateForm(fields, {
    name: ''
  })

  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
})

test('accepts an empty optional field with an email rule', () => {
  const fields = [
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      validationRules: ['EmailRule']
    }
  ]

  const result = validateForm(fields, {
    email: ''
  })

  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
})

test('reject a value shorter than the minimum length', () => {
  const fields = [
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: [
        { name: 'MinLengthRule', value: 8 }
      ]
    }
  ]

  const result = validateForm(fields, {
    password: 'short'
  })

  assert.equal(result.valid, false)
  assert.equal(result.errors[0].fieldId, 'password')

})

test('reject a value longer than the maximum length', () => {
  const fields = [
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: [
        { name: 'MaxLengthRule', value: 5 }
      ]
    }
  ]

  const result = validateForm(fields, {
    password: 'toolong'
  })

  assert.equal(result.valid, false)
  assert.equal(result.errors[0].fieldId, 'password')

})

test('accepts matching field values', () => {
  const fields = [
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: []
    },
    {
      id: 'confirmPassword',
      label: 'Confirm password',
      type: 'password',
      required: true,
      validationRules: [
        { name: 'MatchingFieldsRule', value: 'password' }
      ]
    }
  ]

  const result = validateForm(fields, {
    password: 'password',
    confirmPassword: 'password'
  })

  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])

})

test('rejects non-matching field values', () => {
  const fields = [
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: []
    },
    {
      id: 'confirmPassword',
      label: 'Confirm password',
      type: 'password',
      required: true,
      validationRules: [
        { name: 'MatchingFieldsRule', value: 'password' }
      ]
    }
  ]

  const result = validateForm(fields, {
    password: 'password',
    confirmPassword: 'nomatch'
  })

  assert.equal(result.valid, false)
  assert.ok(
    result.errors.some(error => error.fieldId === 'confirmPassword')
  )

})

test('rejects invalid field configuration input', () => {
  assert.throws(
    () => validateForm(null, {}),
    TypeError
  )

  assert.throws(
    () => validateForm([], null),
    TypeError
  )
})
