import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluatePassword } from '../src/services/password-service.js'

console.log(`\n===== PASSWORD SERVICE TESTS =====`)

test('returns valid for a password meeting all requirements', () => {
  const result = evaluatePassword('myPassword123!')

  assert.equal(result.valid, true)
  assert.equal(result.strength, 'strong password')
  assert.equal(result.score, 5)
  assert.deepEqual(result.suggestions, [])
  assert.equal(result.error, null)
})

test('returns invalid and suggestions for a weak password', () => {
  const result = evaluatePassword('weakpass')

  assert.equal(result.valid, false)
  assert.equal(result.strength, 'weak password')
  assert.ok(result.score < 5)
  assert.ok(result.suggestions.length > 0)
  assert.equal(result.error, null)
})

test('handles empty password without throwing', () => {
  const result = evaluatePassword('')

  assert.equal(result.valid, false)
  assert.equal(result.strength, null)
  assert.equal(result.score, null)
  assert.deepEqual(result.suggestions, [])
  assert.equal(result.error, 'Enter a password to evaluate.')
})

test('handles non-string values without throwing', () => {
  for (const password of [null, undefined, 123, true, {}]) {
    const result = evaluatePassword(password)
    
      assert.equal(result.valid, false)
      assert.equal(result.strength, null)
      assert.equal(result.score, null)
      assert.equal(result.error, 'Enter a password to evaluate.')
  }
})

test('rejects password containing spaces', () => {
  const result = evaluatePassword('myPassword 123!')

  assert.equal(result.valid, false)
  assert.ok(result.suggestions.includes, 'Remove spaces from the password')
})
