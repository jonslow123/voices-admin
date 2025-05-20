'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
// Import any other providers you need
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <AuthProvider>
        {children}
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </ChakraProvider>
  );
} 