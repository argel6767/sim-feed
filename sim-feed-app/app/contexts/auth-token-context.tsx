import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/react-router";
import { setTokenGetter } from "~/api/apiConfig";

type AuthTokenContextType = {
  token: string | null;
  userId: string | null | undefined;
  isReady: boolean;
  refreshToken: () => Promise<string | null>;
};

const AuthTokenContext = createContext<AuthTokenContextType>({
  token: null,
  userId: undefined,
  isReady: false,
  refreshToken: async () => null,
});

export const useAuthToken = () => useContext(AuthTokenContext);

export const AuthTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken, userId, isLoaded } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const refreshToken = useCallback(async () => {
    const t = await getToken();
    setToken(t);
    return t;
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && userId) {
      refreshToken().then(() => setIsReady(true));
    } else if (isLoaded) {
      setToken(null);
      setIsReady(true);
    }
  }, [isLoaded, userId, refreshToken]);

  return (
    <AuthTokenContext.Provider value={{ token, userId, isReady, refreshToken }}>
      {children}
    </AuthTokenContext.Provider>
  );
};