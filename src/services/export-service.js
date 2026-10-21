import { getFieldRequirements } from './requirement-service.js'

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
  const ruleName = typeof rule === 'string' ? rule : rule.name

  switch (ruleName) {
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
  const specialChars = '!@#£$%/\\\\{([)]=}<?+~^*-_.:|>'

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
      : input.type === 'password'
        ? input.value
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
      : input.type === 'password'
        ? input.value
        : input.value.trim()

    let message = ''

    if (input.required && !value) {
      message = 'This field is required.'
    } else {
      if (input.type === 'password' && value !== '') {
        if (!validatePassword(String(value))) {
          message = 'Password does not meet all requirements.'
        }
      }

      if (!message && configuration && value !== '') {
        const failedRule = configuration.validationRules
        .map(rule => typeof rule === 'string' ? { name: rule } : rule)
        .find(rule => !validateRule(rule, String (value), formData))

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
  const rules = fields.map(field => {
    const validationRules = [...field.validationRules]

    if (field.matchingFieldId) {
      validationRules.push({
        name: 'MatchingFieldsRule',
        value: field.matchingFieldId
      })
    }

    return {
      id: field.id,
      required: field.required,
      validationRules
    }
  })

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

    const requirements = getFieldRequirements(field, fields)

    const requirementsHTML = requirements.length > 0
      ? `<fieldset class="field-requirements">
              <legend>Requirements</legend>
              ${requirements.map(requirement =>
        `<p>${escapeHTML(requirement)}</p>`
      ).join('')}
              </fieldset>`
      : ''

    return `
        <div class="preview-field">
        <label for="${id}">${label}${requiredIndicator}</label>
        ${input}
        ${requirementsHTML}
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
    padding: clamp(1.25rem, 3vw, 2rem);
    background: #fff;
    border: 1px solid #e0e5ed;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgb(32 41 56 / 4%);
  }

  h1 {
    margin-top: 0;
    color: #2a3a4d;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
  }

  form,
  .preview-field {
    display: flex;
    flex-direction: column;
  }

  form {
    gap: 1.25rem;
  }

  .preview-field {
    gap: .4rem;
    min-width: 0;
  }

  .preview-field > label {
    color: #35465d;
    font-weight: 600;
  }

  input:not([type="checkbox"]),
  textarea,
  select {
    width: 100%;
    max-width: 450px;
    padding: .65rem;
    border: 1px solid #b8c4d4;
    border-radius: 6px;
    font: inherit;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  input[type="checkbox"] {
    accent-color: #2a3a4d;
  }

  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  button:focus-visible {
    outline: 3px solid #6b8fc4;
    outline-offset: 3px;
  }

  [aria-invalid="true"] {
    border-color: #a12626;
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

  button:hover {
    background: #3c526e;
  }

  .field-requirements {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .4rem .75rem;
    min-width: 0;
    margin: .25rem 0 0;
    padding: .6rem .8rem .75rem;
    border: 1px solid #d8dee7;
    border-radius: 6px;
    background: #f8f9fb;
  }

  .field-requirements legend {
    color: #35465d;
    font-size: .9rem;
    font-weight: 600;
  }

  .field-requirements p {
    display: flex;
    min-width: 0;
    margin: 0;
    font-size: .85rem;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .field-requirements p::before {
    flex: 0 0 .6rem;
    content: "• ";
  }

  .field-error,
  .validation-error {
    color: #a12626;
  }

  .field-error {
    margin: 0;
    font-size: .9rem;
  }

  .validation-success {
    color: #18794e;
  }

  #validation-feedback {
    font-weight: 600;
  }

  .notice {
    margin-top: 1.5rem;
    color: #424b57;
    font-size: .9rem;
  }

  @media (max-width: 600px) {
    main {
      margin: 1rem auto;
      padding: 1.25rem;
    }

    .field-requirements {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 400px) {
    .field-requirements {
      grid-template-columns: 1fr;
    }

    button {
      width: 100%;
    }
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
