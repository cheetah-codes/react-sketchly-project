import { createContext, useState } from "react";
// import { AuthPropType } from "../components/layouts/withAuthLayout";

type AuthProviderProps = {
  children: React.ReactNode;
};

export type AuthUserType = {
  username?: string;
  email?: string;
} & any;

export type AuthContextType = {
  user: AuthUserType | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUserType | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType>(null!);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
