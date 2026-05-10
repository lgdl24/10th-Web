import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import type { RequestSigninDto } from "../types/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { postLogout, postSignin } from "../apis/auth";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  name: string | null;

  /**
   * 로그인 성공 시 true, 실패 시 false 반환.
   * 페이지 이동은 호출한 쪽(LoginPage)에서 담당합니다.
   */
  login: (signInData: RequestSigninDto) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  name: null,
  login: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const {
    getItem: getAccessTokenFromStorage,
    setItem: setAccessTokenInStorage,
    removeItem: removeAccessTokenFromStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.accessToken);
  const {
    getItem: getRefreshTokenFromStorage,
    setItem: setRefreshTokenInStorage,
    removeItem: removeRefreshTokenFromStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.refreshToken);
  const {
    getItem: getNameFromStorage,
    setItem: setNameInStorage,
    removeItem: removeNameFromStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.name);

  const [accessToken, setAccessToken] = useState<string | null>(
    getAccessTokenFromStorage(),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    getRefreshTokenFromStorage(),
  );
  const [name, setName] = useState<string | null>(getNameFromStorage());

  /** 성공 true / 실패 false 반환 — 이동 로직은 LoginPage 담당 */
  const login = async (signinData: RequestSigninDto): Promise<boolean> => {
    try {
      const { data } = await postSignin(signinData);

      if (data) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setName(data.name);

        setAccessTokenInStorage(data.accessToken);
        setRefreshTokenInStorage(data.refreshToken);
        setNameInStorage(data.name);

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await postLogout();

      removeAccessTokenFromStorage();
      removeRefreshTokenFromStorage();
      removeNameFromStorage();

      setAccessToken(null);
      setRefreshToken(null);
      setName(null);

      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, name, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
