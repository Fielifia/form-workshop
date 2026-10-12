import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateForm } from '../src/services/validation-service.js'

test('accepts valid input', () => {
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
