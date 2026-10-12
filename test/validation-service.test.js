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
