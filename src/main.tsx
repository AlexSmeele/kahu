import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/performance' // Initialize global error handlers
import { DevicePreviewProvider } from './preview/DevicePreviewProvider'
import { ResponsiveShell } from './preview/ResponsiveShell'
import { SafeAreaProvider } from './contexts/SafeAreaContext'
import { StatusBarController } from './components/headers/StatusBarController'

createRoot(document.getElementById("root")!).render(
  <DevicePreviewProvider>
    <SafeAreaProvider debug={false}>
      <StatusBarController visible={true} style="auto" backgroundAtTop="hsl(var(--background))">
        <ResponsiveShell>
          <App />
        </ResponsiveShell>
      </StatusBarController>
    </SafeAreaProvider>
  </DevicePreviewProvider>
);
