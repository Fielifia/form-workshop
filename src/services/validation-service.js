import Field from 'laboration-2/src/Field.js'
import {
  EmailRule,
  LowercaseRule,
  MatchingFieldsRule,
  MaxLengthRule,
  MinLengthRule,
  NoCodeOrLinksRule,
  OnlyDigitsRule,
  OnlyLettersRule,
  RequiredRule,
  SpecialCharacterRule,
  UppercaseRule,
} from 'laboration-2/src/Rule.js'
import Validation from 'laboration-2/src/Validation.js'

const RULE_FACTORIES = {
  RequiredRule: () => new RequiredRule(),
  EmailRule: () => new EmailRule(),
  OnlyLettersRule: () => new OnlyLettersRule(),
  OnlyDigitsRule: () => new OnlyDigitsRule(),
  UppercaseRule: () => new UppercaseRule(),
  LowercaseRule: () => new LowercaseRule(),
  SpecialCharacterRule: () => new SpecialCharacterRule(),
  NoCodeOrLinksRule: () => new NoCodeOrLinksRule(),
  MinLengthRule: value => new MinLengthRule(value),
  MaxLengthRule: value => new MaxLengthRule(value),
  MatchingFieldsRule: value => new MatchingFieldsRule(value)
}

/**
 * Creates a rule instance from an configured rule.
 * 
 * @param {string|object} configuredRule - The configured rule.
 * @returns {object} An instance of a validation rule.
 * @throws {TypeError} If the rule configuration is invalid.
 * @throws {Error} If the rule is unsupported.
 */
function createRule(configuredRule) {
  if (
    typeof configuredRule !== 'string' &&
    (!configuredRule ||
      typeof configuredRule !== 'object' ||
      Array.isArray(configuredRule))
  ) {
    throw new TypeError('Invalid rule configuration.')
  }

  const name = typeof configuredRule === 'string'
    ? configuredRule
    : configuredRule?.name

  const factory = RULE_FACTORIES[name]

  if (!factory) {
    throw new Error(`Unsupported validation rule: ${name}`)
  }

  const value = typeof configuredRule === 'object'
    ? configuredRule.value
    : undefined
  
  if (
    (name === 'MinLengthRule' || name === 'MaxLengthRule') &&
    (!Number.isInteger(value) || value < 0)
  ) {
    throw new TypeError(`Invalid configuration for ${name}.`)
  }

  if (
    name === 'MatchingFieldsRule' &&
    (typeof value !== 'string' || value.trim() === '')
  ) {
    throw new TypeError(`Invalid configuration for ${name}.`)
  }

  return factory(value)
}

/**
 * Creates a validation configuration from the form model.
 * 
 * @param {Array<object>} fields - Configured form fields.
 * @returns {Validation} A configured validation instance.
 */

function createValidation(fields) {
  const validation = new Validation()

  fields.forEach(config => {
    const field = new Field(config.id)

    if (config.required) {
      field.addRule(new RequiredRule())
    }

    config.validationRules.forEach(configuredRule => {
      const ruleName = typeof configuredRule === 'string'
        ? configuredRule
        : configuredRule.name

      if (ruleName === 'RequiredRule' && config.required) {
        return
      }

      field.addRule(createRule(configuredRule))
    })

    if (config.matchingFieldId) {
      field.addRule(
        new MatchingFieldsRule(config.matchingFieldId)
      )
    }

    validation.addField(field)
  })

  return validation
}

/**
 * Validates submitted values against the configured form fields.
 * 
 * @param  {Array<object>} fields - Configured form fields.
 * @param {object} values . Values indexed by field ID.
 * @returns {{valid: boolean, errors: Array<{ fieldId: string, message: string}> }}
 * Validation status and field specific errors
 */
export function validateForm(fields, values) {
  if (!Array.isArray(fields)) {
    throw new TypeError('Fields must be an array.')
  }

  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Form values must be an object.')
  }

  const validation = createValidation(fields)
  const result = validation.validate(values)

  return {
    valid: result.success,
    errors: result.errors.map(error => ({
      fieldId: error.field.identifier,
      message: error.errorMessage
    }))
  }
}
