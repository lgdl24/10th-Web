import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { RequestSigninDto } from "../types/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { getMyInfo, postLogout, postSignin } from "../apis/auth";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  name: string | null;
  userId: number | null;

  /**
   * 로그인 성공 시 true, 실패 시 false 반환.
   * 페이지 이동은 호출한 쪽(LoginPage)에서 담당합니다.
   */
  login: (signInData: RequestSigninDto) => Promise<boolean>;
  logout: () => Promise<void>;
  /** 탈퇴 성공 후 로컬 상태만 초기화 (API 호출 없음) */
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  name: null,
  userId: null,
  login: async () => false,
  logout: async () => {},
  clearAuth: () => {},
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
  const {
    getItem: getUserIdFromStorage,
    setItem: setUserIdInStorage,
    removeItem: removeUserIdFromStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.userId);

  const [accessToken, setAccessToken] = useState<string | null>(
    getAccessTokenFromStorage(),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    getRefreshTokenFromStorage(),
  );
  const [name, setName] = useState<string | null>(getNameFromStorage());
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = getUserIdFromStorage();
    return stored ? Number(stored) : null;
  });

  /**
   * 앱 시작 시 accessToken은 있는데 userId가 없으면 (= 이전에 로그인한 기존 세션)
   * /v1/users/me 를 호출해서 userId를 채웁니다.
   */
  useEffect(() => {
    if (accessToken && userId === null) {
      getMyInfo()
        .then(({ data }) => {
          if (data?.id) {
            setUserId(data.id);
            setUserIdInStorage(String(data.id));
          }
        })
        .catch(() => {
          // 토큰이 만료된 경우 등 — 무시 (axios 인터셉터가 refresh 처리)
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  /** 성공 true / 실패 false 반환 — 이동 로직은 LoginPage 담당 */
  const login = async (signinData: RequestSigninDto): Promise<boolean> => {
    try {
      const { data } = await postSignin(signinData);

      if (data) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setName(data.name);
        setUserId(data.id);

        setAccessTokenInStorage(data.accessToken);
        setRefreshTokenInStorage(data.refreshToken);
        setNameInStorage(data.name);
        setUserIdInStorage(String(data.id));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    await postLogout();

    removeAccessTokenFromStorage();
    removeRefreshTokenFromStorage();
    removeNameFromStorage();
    removeUserIdFromStorage();

    setAccessToken(null);
    setRefreshToken(null);
    setName(null);
    setUserId(null);
  };

  /** 탈퇴 성공 후 로컬 상태만 초기화 (API 호출 없음) */
  const clearAuth = () => {
    removeAccessTokenFromStorage();
    removeRefreshTokenFromStorage();
    removeNameFromStorage();
    removeUserIdFromStorage();

    setAccessToken(null);
    setRefreshToken(null);
    setName(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, name, userId, login, logout, clearAuth }}
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
