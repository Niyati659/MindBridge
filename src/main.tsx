import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

// DEBUG: Verify JS is running
console.log('Main.tsx is running');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<h1>Error: Root element not found</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (e) {
    console.error('React render failed:', e);
    document.body.innerHTML = `<h1>React Crash: ${e}</h1>`;
  }
}
