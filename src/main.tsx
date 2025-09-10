import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/performance' // Initialize global error handlers

createRoot(document.getElementById("root")!).render(<App />);
