import Validation from 'laboration-2/src/Validation.js'
import Field from 'laboration-2/src/Field.js'
import {
  RequiredRule,
  EmailRule,
  MinLengthRule,
  MaxLengthRule,
  MinValueRule,
  MaxValueRule,
  OnlyLettersRule,
  OnlyDigitsRule,
  UppercaseRule,
  LowercaseRule,
  SpecialCharacterRule,
  NoCodeOrLinksRule,
  MatchingFieldsRule
} from 'laboration-2/src/Rule.js'
 
const RULE_FACTORIES = {
  RequiredRule: () => new RequiredRule(),
  EmailRule: () => new EmailRule(),
  OnlyLettersRule: () => new OnlyLettersRule(),
  OnlyDigitsRule: () => new OnlyDigitsRule(),
  UppercaseRule: () => new UppercaseRule(),
  LowercaseRule: () => new LowercaseRule(),
  SpecialCharacterRule: () => new SpecialCharacterRule(),
  NoCodeOrLinksRule: () => new NoCodeOrLinksRule()
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

    config.validationRules.forEach(ruleName => {
      if (ruleName === 'MinLengthRule') {
        field.addRule(new MinLengthRule(1))
      } else if (ruleName === 'MaxLengthRule') {
        field.addRule(new MaxLengthRule(255))
      } else if (ruleName === 'MatchingFieldsRule') {
        throw new Error('MatchingFieldsRule requires a reference field identifier.')
      } else {
        const createRule = RULE_FACTORIES[ruleName]

        if (!createRule) {
          throw new Error(`Unsupported validation rule: ${ruleName}`)
        }

        if (ruleName !== 'RequiredRule' || !config.required) {
          field.addRule(createRule())
        }
      }
    })

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
