import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/performance' // Initialize global error handlers
import { DevicePreviewProvider } from './preview/DevicePreviewProvider'
import { ResponsiveShell } from './preview/ResponsiveShell'

createRoot(document.getElementById("root")!).render(
  <DevicePreviewProvider>
    <ResponsiveShell>
      <App />
    </ResponsiveShell>
  </DevicePreviewProvider>
);
