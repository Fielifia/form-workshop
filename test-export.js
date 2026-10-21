
import { writeFile } from 'node:fs/promises'
import { generateHTML } from './src/services/export-service.js'

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
      { name: 'MatchingFieldsRule', value: 'password' }
    ]
  }
])

await writeFile('test-export.html', html, 'utf8')
console.log('Created test-export.html')
