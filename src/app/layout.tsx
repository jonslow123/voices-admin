'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
