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

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const fields = Array.from(form.querySelectorAll('.preview-field'))
    let isValid = true

    feedback.textContent = ''
    feedback.className = ''

    fields.forEach((field) => {
      const input = field.querySelector('input, textarea')
      const error = field.querySelector('.field-error')

      error.textContent = ''
      error.hidden = true
      input.removeAttribute('aria-invalid')

      const value = input.type === 'checkbox'
        ? input.checked
        : input.value.trim()
      
      let message = ''

      if (input.required && !value) {
        message = 'This field is required.'
      } else if (input.type === 'email' && value &&
        !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        message = 'Please enter a valid email address.'
      }

      if (message) {
        isValid = false
        error.textContent = message
        error.hidden = false
        input.setAttribute('aria-invalid', 'true')
      )
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
