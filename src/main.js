import './styles/main.css'

const createFormButton = document.querySelector('#create-form-button')
const statusMessage = document.querySelector('#status-message')

createFormButton.addEventListener('click', () => {
  statusMessage.textContent = 'Your form workspace is ready to build.'
})
