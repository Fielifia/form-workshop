import { PasswordValidator } from '../../../password-module/src/index.js'

const validator = new PasswordValidator()

/**
 * Validates a password and returns its strength and suggestions.
 *
 * @param {*} password - The password to evaluate.
 * @returns {object} The validation result.
 */
export function evaluatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return {
      valid: false,
      strength: null,
      score: null,
      suggestions: [],
      error: 'Enter a password to evaluate.',
    }
  }

  const valid = validator.isValidPassword(password)
  const result = validator.getStrength(password)

  return {
    valid,
    strength: result.getLabel(),
    score: result.getScore(),
    suggestions: result.suggestions,
    error: null,
  }
}
