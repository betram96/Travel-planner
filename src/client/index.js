import { submitText } from './js/app'
import './styles/style.scss'

// Add event listener for the Generate button
document.getElementById('generate').addEventListener('click', submitText);

export {
    submitText
}