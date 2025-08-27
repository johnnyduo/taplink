import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppKitProvider } from './lib/appkit'
import { Toaster } from 'sonner'

createRoot(document.getElementById("root")!).render(
  <AppKitProvider>
    <App />
    <Toaster 
      theme="dark" 
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          color: '#f8fafc',
        },
      }}
    />
  </AppKitProvider>
);
