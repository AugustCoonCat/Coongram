import { getCurrentUser } from "@/lib/appwrite/api";
import { IContextType, IUser } from "@/types";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { INITIAL_STATE } from "./authConstants";
import Loader from "@/components/shared/Loader";

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();

 const checkAuthUser = async (): Promise<boolean> => {
  try {
    const currentAccount = await getCurrentUser();
    if (currentAccount) {
      setUser({
        $id: currentAccount.$id,
        id: currentAccount.$id,
        name: currentAccount.name,
        username: currentAccount.username,
        email: currentAccount.email,
        imageUrl: currentAccount.imageUrl,
        bio: currentAccount.bio,
      });
      return true;
    } else {
      setUser(null);
      return false;
    }
  } catch (error) {
    console.log(error);
    setUser(null);
    return false;
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    const item = localStorage.getItem("cookieFallback");
    if (item === "[]" || item === null) navigate("/sign-in");
    checkAuthUser();
  }, []);

  if (isLoading) return <Loader />; 

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: Boolean(user),
    checkAuthUser,
  };


return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useUserContext = () => useContext(AuthContext);