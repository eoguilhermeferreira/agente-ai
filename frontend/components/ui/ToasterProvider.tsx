'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
        },
        success: { iconTheme: { primary: '#A61B4D', secondary: '#fff' } },
      }}
    />
  );
}
