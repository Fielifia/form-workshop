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
