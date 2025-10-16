import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
if ('serviceWorker' in navigator) { window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/service-worker.js').then(()=>console.log('✅ Service Worker registered')).catch((err)=>console.error('SW failed', err)) }) }