import React, { createContext, useContext, useState, ReactNode } from 'react';

// ✅ Extend AuthData to include `name`
type AuthData = {
  token: string | null;
  role: string | null;
  userId: string | null;
  name: string | null; // 👈 added
};

type AuthContextType = {
  authData: AuthData;
  login: (data: { token: string; role: string; userId: string; name: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('name'), // 👈 load from localStorage
  });

  const login = ({ token, role, userId, name }: { token: string; role: string; userId: string; name: string }) => {
    setAuthData({ token, role, userId, name });
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name); // 👈 store in localStorage
  };

  const logout = () => {
    setAuthData({ token: null, role: null, userId: null, name: null });
    localStorage.clear(); // or selectively remove keys
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
