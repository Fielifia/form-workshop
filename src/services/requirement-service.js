/**
 * Returns readable descriptions for a field.
 * 
 * @param {object} field - The configured form field.
 * @returns {string[]} The field requirements.
 */
export function getFieldRequirements(field, fields = []) {
  const requirements = []

  if (field.required) {
    requirements.push('This field is required.')
  }

  const rules = field.validationRules.map(rule => ({
    name: typeof rule === 'string' ? rule : rule.name,
    value: typeof rule === 'string' ? undefined : rule.value
  }))

  const minLength = rules.find(rule => rule.name === 'MinLengthRule')
  const maxLength = rules.find(rule => rule.name === 'MaxLengthRule')

  if (minLength && maxLength) {
    requirements.push(
      minLength.value === maxLength.value
        ? `Exactly ${minLength.value} characters.`
        : `Between ${minLength.value} and ${maxLength.value} characters.`
    )
  } else if (minLength) {
    requirements.push(`At least ${minLength.value} characters.`)
  } else if (maxLength) {
    requirements.push(`At most ${maxLength.value} characters.`)
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

  const ruleNames = new Set(rules.map(rule => rule.name))

  rules.forEach(rule => {
    if (
      rule.name === 'MinLengthRule' ||
      rule.name === 'MaxLengthRule' ||
      (rule.name === 'UppercaseRule' && ruleNames.has('LowercaseRule')) ||
      (rule.name === 'LowercaseRule' && ruleNames.has('UppercaseRule'))
    ) {
      return
    }

    if (rule.name === 'MatchingFieldsRule') {
      const matchingField = fields.find(
        item => item.id === rule.value
      )
      requirements.push(
        matchingField
          ? `Must match the field "${matchingField.label}".`
          : `Must match the specified field.`
      )
    } else if (messages[rule.name]) {
      requirements.push(messages[rule.name])
    }
  })

  if (ruleNames.has('UppercaseRule') && ruleNames.has('LowercaseRule')) {
    requirements.push('Include uppercase and lowercase letters.')

  }
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
