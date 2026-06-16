//import { StrictMode } from 'react'
//import { createRoot } from 'react-dom/client'
//import './App.css'
//import App from './App.jsx'

//createRoot(document.getElementById('root')).render(
//  <StrictMode>
//    <App />
//  </StrictMode>,
//)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Invitation from './Invitation.jsx' // On importe la nouvelle page
import './App.css'

// On lit l'URL pour savoir quoi afficher
const params = new URLSearchParams(window.location.search);
const isInvitation = params.get('type') === 'invitation';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Si l'URL contient ?type=invitation, on affiche l'Invitation, sinon le Save the Date */}
    {isInvitation ? <Invitation /> : <App />}
  </React.StrictMode>,
)