import test from 'node:test'
import assert from 'node:assert/strict'
import { generateHTML } from '../src/services/export-service.js'

console.log(`\n===== EXPORT SERVICE TESTS =====`)

test('should generate a complete HTML document', () => {
  const html = generateHTML([])

  assert.ok(html.includes('<!DOCTYPE html>'))
  assert.ok(html.includes('<html'))
  assert.ok(html.includes('</html>'))
  assert.ok(html.includes('<style>'))
})

test('should generate a text field with its label', () => {
  const fields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      validationRules: []
    }
  ]

  const html = generateHTML(fields)

  assert.ok(html.includes('id="name"'))
  assert.ok(html.includes('name="name"'))
  assert.ok(html.includes('Name'))
  assert.ok(html.includes('type="text"'))
})

test('should generate a textarea for textarea fields', () => {
  const fields = [
    {
      id: 'message',
      label: 'Message',
      type: 'textarea',
      required: false,
      validationRules: []
    }
  ]

  const html = generateHTML(fields)

  assert.ok(html.includes('<textarea'))
  assert.ok(html.includes('id="message"'))
})

test('should mark required fields', () => {
  const fields = [
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validationRules: []
    }
  ]

  const html = generateHTML(fields)

  assert.ok(html.includes('required'))
  assert.ok(html.includes('Email *'))
})

test('should escape HTML in field labels', () => {
  const fields = [
    {
      id: 'name',
      label: '<script>alert("test")</script>',
      type: 'text',
      required: false,
      validationRules: []
    }
  ]

  const html = generateHTML(fields)

  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>alert'))
})

test('should throw a TypeError when fields is not an array', () => {
  assert.throws(() => generateHTML(null), TypeError)
})

test('should include client-side validation code', () => {
  const html = generateHTML([])

  assert.ok(html.includes("addEventListener('submit'"))
  assert.ok(html.includes('Please enter a valid email address.'))
  assert.ok(html.includes('Please correct the errors above.'))
})

test('should include configured validation rules in exported HTML', () => {
  const fields = [
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      required: false,
      validationRules: [
        { name: 'MinLengthRule', value: 5 }
      ]
    }
  ]

  const html = generateHTML(fields)

  assert.ok(html.includes('MinLengthRule'))
  assert.ok(html.includes('"value":5'))
})

test('generates syntactically valid JavaScript', () => {
  const html = generateHTML([])
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1]

  assert.doesNotThrow(() => {
    new Function(script)
  })
})

test('includes matching field validation in exported JavaScript', () => {
  const html = generateHTML([
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validationRules: []
    },
    {
      id: 'confirm-password',
      label: 'Confirm password',
      type: 'password',
      required: true,
      validationRules: [
        {
          name: 'MatchingFieldsRule',
          value: 'password'
        }
      ] 
    }
  ])

  assert.match(html, /MatchingFieldsRule/)
  assert.match(html, /formData\[rule\.value\]/)
})

test('exports matching fields validation logic', () => {
  const html = generateHTML([
    {
      id: 'password',
      label: 'Password',
      type: 'text',
      required: true,
      validationRules: []
    },
    {
      id: 'confirm-password',
      label: 'Confirm password',
      type: 'text',
      required: true,
      validationRules: [
        {
          name: 'MatchingFieldsRule',
          value: 'password'
        }
      ]
    }
  ])

  assert.match(html, /MatchingFieldsRule/)
  assert.match(html, /value === formData\[rule\.value\]/)
  assert.match(html, /The fields do not match\./)
})

test('preserves backslash as an allowed password special character', () => {
  const html = generateHTML([])

  assert.match(html, /const specialChars = .*\\/)
})
