import React from 'react';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

