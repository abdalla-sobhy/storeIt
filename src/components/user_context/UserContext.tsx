import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Define the structure of the user object (customize as needed)
interface User {
  id: number;
  name: string;
  email: string;
  // Add more fields based on your API response
}

// Define the context value type
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create the UserContext with the proper type
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the props for the UserProvider
interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigateTo = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (location.pathname !== "/") {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/user/validate-current-user", {
            method: "GET",
          });
          const result = await response.json();
          if (response.ok) {
            setUser(result);
            return;
          }
          navigateTo("/");
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };
      fetchUserData();
    }
  }, [location.pathname, navigateTo]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
