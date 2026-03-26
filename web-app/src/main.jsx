import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
/**
 * main.jsx
 * -----------------------
 * This is the entry point of the TimeSync React application. It imports the necessary modules and 
 * styles, and renders the main App component into the root DOM element. The StrictMode component is 
 * used to enable additional checks and warnings for potential issues in the application during 
 * development. The createRoot function from React DOM is used to create a root for rendering the App 
 * component, ensuring that the application is properly initialized and displayed in the browser.
 * 
 */

// Render the App component wrapped in StrictMode to the root DOM element with the ID 'root'.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
