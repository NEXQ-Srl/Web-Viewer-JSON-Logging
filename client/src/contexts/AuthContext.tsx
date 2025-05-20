import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccountInfo, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalInstance, handleRedirectCallback } from '../services/authService';

interface AuthContextType {
  user: AccountInfo | null;
  login: () => Promise<AccountInfo | null>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Handle redirect if using redirect flow
        await handleRedirectCallback();
        
        // Check if user is already signed in
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts.length > 0) {
          setUser(currentAccounts[0]);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Register event handlers for auth state changes
    const loginSuccessHandler = (event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        setUser(payload.account || null);
      }
    };

    // Register event callbacks
    const callbackId = msalInstance.addEventCallback(loginSuccessHandler);
    
    // Initialize
    initializeAuth();

    // Cleanup
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  const login = async (): Promise<AccountInfo | null> => {
    try {
      const loginRequest = {
        scopes: ['User.Read']
      };
      
      const response = await msalInstance.loginPopup(loginRequest);
      setUser(response.account);
      return response.account;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  const logout = (): void => {
    const logoutRequest = {
      account: user || undefined
    };
    
    msalInstance.logoutPopup(logoutRequest).catch(e => {
      console.error("Logout error:", e);
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
