import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Invitation from './Invitation.jsx'
import Scanner from './Scanner.jsx' // On importe le scanner
import './App.css'

const params = new URLSearchParams(window.location.search);
const pageType = params.get('type');

// L'Aiguilleur intelligent
let ComponentToRender = <App />; // Par défaut, le Save the Date

if (pageType === 'invitation') {
  ComponentToRender = <Invitation />;
} else if (pageType === 'scanner') {
  ComponentToRender = <Scanner />; // Lien secret pour les hôtesses !
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {ComponentToRender}
  </React.StrictMode>,
)