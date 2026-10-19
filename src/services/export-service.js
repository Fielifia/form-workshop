/**
 * Escapes a value before inserting it into HTML markup.
 * 
 * @param {*} value - The value to escape.
 * @returns {string} The escaped value.
 */
function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Generated standalone client-side validation code.
 * 
 * @returns {string} JavaScript code for validating form fields.
 */
function generateValidationScript() {
  return `

const form = document.getElementById('exported-form')
const feedback = document.getElementById('validation-feedback')
const fieldConfigurations = JSON.parse(
  document.getElementById('validation-rules').textContent
)

function validateRule(rule, value, formData) {
  switch (rule.name) {
  case 'EmailRule':
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)

  case 'OnlyLettersRule':
    return /^\\p{L}*$/u.test(value)

  case 'OnlyDigitsRule':
    return /^\\d+$/.test(value)

  case 'UppercaseRule':
    return /\\p{Lu}/u.test(value)

  case 'LowercaseRule':
    return /\\p{Ll}/u.test(value)

  case 'SpecialCharacterRule':
    return /[^\\p{L}\\d\\s]/u.test(value)

  case 'MinLengthRule':
    return value.length >= rule.value

  case 'MaxLengthRule':
    return value.length <= rule.value

  case 'NoCodeOrLinksRule':
    return !(
      /<[^>]*>|javascript:/i.test(value) ||
      /(https?:\\/\\/[^\\s]+|www\\.[^\\s]+|[a-zA-Z0-9-]+\\.[a-zA-Z]{2,})/i.test(value)
    )

  case 'MatchingFieldsRule':
    return value === formData[rule.value]

  default:
    return true
  }
}

function validatePassword(password) {
  const specialChars = '!@#£$%/\\{([)]=}<?+~^*-_.:|>'

  const hasUppercase = [...password].some(
    character => character === character.toUpperCase() &&
      character !== character.toLowerCase()
  )

  const hasLowercase = [...password].some(
    character => character === character.toLowerCase() &&
      character !== character.toUpperCase()
  )

  return password.length >= 10 &&
    hasUppercase &&
    hasLowercase &&
    /[0-9]/.test(password) &&
    [...password].some(character => specialChars.includes(character)) &&
    !password.includes(' ')
}

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const fields = Array.from(form.querySelectorAll('.preview-field'))
  let isValid = true
  const formData = {}

  fields.forEach((field) => {
    const input = field.querySelector('input, textarea')

    formData[input.id] = input.type === 'checkbox'
      ? input.checked
      : input.value.trim()
  })

  feedback.textContent = ''
  feedback.className = ''

  fields.forEach((field) => {
    const input = field.querySelector('input, textarea')
    const error = field.querySelector('.field-error')

    const configuration = fieldConfigurations.find(
      item => item.id === input.id
    )

    error.textContent = ''
    error.hidden = true
    input.removeAttribute('aria-invalid')

    const value = input.type === 'checkbox'
      ? input.checked
      : input.value.trim()

    let message = ''

    if (input.required && !value) {
      message = 'This field is required.'
    } else if (input.type === 'password' && value !== '') {
      if (!validatePassword(String(value))) {
        message = 'Password does not meet all requirements.'
      }
     } else if (configuration && value !== '') {
      const failedRule = configuration.validationRules.find(
        rule => !validateRule(rule, String(value), formData)
      )

      if (failedRule) {
        const messages = {
          EmailRule: 'Please enter a valid email address.',
          OnlyLettersRule: 'This field may only contain letters.',
          OnlyDigitsRule: 'This field may only contain digits.',
          UppercaseRule: 'This field must contain an uppercase letter.',
          LowercaseRule: 'This field must contain a lowercase letter.',
          SpecialCharacterRule: 'This field must contain a special character.',
          NoCodeOrLinksRule: 'This field may not contain code or links.',
          MatchingFieldsRule: 'The fields do not match.'
        }

        if (failedRule.name === 'MinLengthRule') {
          message = 'This field must contain at least ' + failedRule.value + ' characters.'
        } else if (failedRule.name === 'MaxLengthRule') {
          message = 'This field may contain at most ' + failedRule.value + ' characters.'
        } else {
          message = messages[failedRule.name] || 'Invalid value.'
        }
      }
    }

    if (message) {
      isValid = false
      error.textContent = message
      error.hidden = false
      input.setAttribute('aria-invalid', 'true')
    }
  })

  if (isValid) {
    feedback.textContent = 'All fields are valid.'
    feedback.className = 'validation-success'
  } else {
    feedback.textContent = 'Please correct the errors above.'
    feedback.className = 'validation-error'
  }
})
`
}

/**
 * Serializes validation rules safely for embedding in HTML.
 * 
 * @param {Array<object>} fields - Configured form fields.
 * @returns {string} JSON representation of the validation rules.
 */
function serializeValidationRules(fields) {
  const rules = fields.map(field => ({
    id: field.id,
    required: field.required,
    validationRules: field.validationRules
  }))

  return JSON.stringify(rules).replaceAll('<', '\\u003c')
}

/**
 * Generates a standalone HTML document from configured fields.
 * 
 * @param {Array<object>} fields - The configured form fields.
 * @returns {string} A complete HTML document.
 */
export function generateHTML(fields) {
  if (!Array.isArray(fields)) {
    throw new TypeError('Fields must be an array.')
  }

  const formFields = fields.map(field => {
    const id = escapeHTML(field.id)
    const label = escapeHTML(field.label)
    const type = field.type === 'textarea'
      ? 'textarea'
      : escapeHTML(field.type)

    const required = field.required ? ' required' : ''
    const requiredIndicator = field.required ? ' *' : ''

    const input = field.type === 'textarea'
      ? `<textarea id="${id}" name="${id}"${required}></textarea>`
      : field.type === 'checkbox'
        ? `<input type="checkbox" id="${id}" name="${id}"${required}>`
        : `<input type="${type}" id="${id}" name="${id}"${required}>`

    return `
        <div class="preview-field">
        <label for="${id}">${label}${requiredIndicator}</label>
        ${input}
        <p class="field-error" id="${id}-error" hidden></p>
        </div>
        `
  }).join('\n')

  const validationRules = serializeValidationRules(fields)

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Form</title>
  <style>
    :root {
      font-family: Arial, Helvetica, sans-serif;
      color: #242424;
      background: #f5f6f8;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-width: 320px;
    }

    main {
      width: min(100% - 2rem, 960px);
      margin: 2rem auto;
      padding: 2rem;
      background: #fff;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .preview-field {
      display: flex;
      flex-direction: column;
      gap: .4rem;
    }

    input:not([type="checkbox"]),
    textarea {
      box-sizing: border-box;
      width: 100%;
      max-width: 450px;
      padding: .65rem;
      font: inherit;
    }

    button {
      width: fit-content;
      padding: .75rem 1rem;
      border: 0;
      border-radius: 6px;
      background: #2a3a4d;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }

    .field-error,
    .validation-error {
      color: #a12626;
    }

    .validation-success {
      color: #18794e;
    }

    .field-error {
      margin: 0;
      font-size: .9rem;
    }

    .notice {
      margin-top: 1.5rem;
      color: #424b57;
      font-size: .9rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>Form</h1>
    <form id="exported-form" novalidate>
      ${formFields}
      <button type="submit">Validate form</button>
      <div id="validation-feedback" aria-live="polite"></div>
    </form>
    <p class="notice">
      This form validates your input locally. It does not submit or save data.
    </p>
  </main>
  <script id="validation-rules" type="application/json">
  ${validationRules}
  </script>
  
  <script>
  ${generateValidationScript()}
  </script>
</body>
</html>`
}
