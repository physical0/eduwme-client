import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import streakService from "../contexts/StreakService.tsx";

interface User {
  _id: string;
  username: string;
  role: string;
  xp?: number; // Make optional with ?
  gems?: number; // Make optional with ?
  inventory?: Array<{
    itemId: string;
    dateAcquired: Date;
    isEquipped: boolean;
  }>;
  streak?: number; // Optional streak property
  lastLoginDate?: Date; // Optional last login date
}


interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  updateUserStreak: () => Promise<void>;
  getAuthHeader: () => Promise<{ Authorization?: string | undefined }>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fixed: Use import.meta.env for Vite
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchUser();
  }, []);

  // ...existing code...
  const fetchUser = async () => {
    try {
      // First try with credentials (cookies)
      const response = await fetch(`${API_BASE_URL}/users/getme`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // If cookie authentication fails, try with token from sessionStorage
        const fallbackToken = sessionStorage.getItem("authToken");

        if (fallbackToken) {
          const fallbackResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${fallbackToken}`
            },
          });

          if (fallbackResponse.ok) {
            const userData = await fallbackResponse.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token in sessionStorage is invalid, clear it
            sessionStorage.removeItem("authToken");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call your logout API endpoint
      await fetch(`${API_BASE_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      sessionStorage.removeItem("authToken");

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      // Get the response data which includes token and fallbackRequired flag
      const responseData = await response.json();

      // Store token in sessionStorage as fallback
      if (responseData.fallbackRequired && responseData.token) {
        sessionStorage.setItem("authToken", responseData.token);
      }

      // After successful login, fetch the user data
      const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
        credentials: "include",
        headers: responseData.token ? {
          "Authorization": `Bearer ${responseData.token}`
        } : {},
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      else {
        throw new Error("Failed to get user data after login");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const updateUserStreak = useCallback(async () => {
    if (user && isAuthenticated) {
      // Pass the getAuthHeader function to the streakService
      const streakInfo = await streakService.updateStreak(getAuthHeader);

      if (streakInfo) {
        // Update user with new streak information
        setUser(prev => prev ? {
          ...prev,
          streak: streakInfo.streak,
          lastLoginDate: new Date(streakInfo.currentDate)
        } : null);

        // If streak milestone reached, show notification
        if (streakInfo.streakUpdated && streakInfo.streak > 0 && streakInfo.streak % 5 === 0) {
          console.log(`Congratulations! You've reached a ${streakInfo.streak} day streak!`);
        }
      }
    }
  }, [user, isAuthenticated]);

  const getAuthHeader = async () => {
    const fallbackToken = sessionStorage.getItem("authToken");
    return fallbackToken ? { Authorization: `Bearer ${fallbackToken}` } : {};
  }


  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    logout,
    login,
    updateUserStreak,
    getAuthHeader,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
