import React, { createContext, useContext, ReactNode } from 'react';
import { useLogin } from '@/app/hooks/useLogin';

// Create context with the return type of useLogin
type LoginContextType = ReturnType<typeof useLogin>;

// Create the context with a default undefined value
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// Provider component
export function LoginProvider({ children }: { children: ReactNode }) {
  const loginState = useLogin();
  
  return (
    <LoginContext.Provider value={loginState}>
      {children}
    </LoginContext.Provider>
  );
}

// Custom hook to use the login context
export function useLoginContext() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
} 