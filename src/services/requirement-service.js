/**
 * Returns readable descriptions for a field.
 * 
 * @param {object} field - The configured form field.
 * @returns {string[]} The field requirements.
 */
export function getFieldRequirements(field) {
  const requirements = []

  if (field.required) {
    requirements.push('This field is required.')
  }

  const messages = {
    EmailRule: 'Enter a valid email address.',
    OnlyLettersRule: 'Use letters only.',
    OnlyDigitsRule: 'Use digits only.',
    UppercaseRule: 'Include an uppercase letter.',
    LowercaseRule: 'Include a lowercase letter.',
    SpecialCharacterRule: 'Include a special character.',
    NoCodeOrLinksRule: 'Code and links are not allowed.'
  }

  field.validationRules.forEach(rule => {
    const name = typeof rule === 'string' ? rule : rule.name
    const value = typeof rule === 'string' ? undefined : rule.value

    if (name === 'MinLengthRule') {
      requirements.push(`At least ${value} characters.`)
    } else if (name === 'MaxLengthRule') {
      requirements.push(`At most ${value} characters.`)
    } else if (name === 'MatchingFieldsRule') {
      requirements.push(`Must match the field ${value}.`)
    } else if (messages[name]) {
      requirements.push(messages[name])
    }
  })

  if (field.type === 'password') {
    requirements.push(
      'At least 10 characters.',
      'Include an uppercase letter.',
      'Include a lowercase letter.',
      'Include a number.',
      'Include an allowed special character.',
      'No spaces.'
    )
  }

  return [...new Set(requirements)]
}
