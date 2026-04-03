import { useSyncExternalStore } from 'react';
import type {
  AuthUser,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './api/types';

const ACCESS_TOKEN_STORAGE_KEY = 'rongchuan-admin-access-token';
const USER_STORAGE_KEY = 'rongchuan-admin-user';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEV_BYPASS_TOKEN = '__DEV_BYPASS_TOKEN__';

type AuthSnapshot = {
  initialized: boolean;
  accessToken: string | null;
  user: AuthUser | null;
};

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type RequestOptions = {
  auth?: boolean;
  retry?: boolean;
};

const listeners = new Set<() => void>();
let refreshPromise: Promise<string | null> | null = null;
let initializePromise: Promise<void> | null = null;

let authState: AuthSnapshot = {
  initialized: false,
  accessToken: readAccessToken(),
  user: readUser(),
};

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function readAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
}

function readUser() {
  const raw = getStorage()?.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistAuthState() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (authState.accessToken) {
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, authState.accessToken);
  } else {
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  if (authState.user) {
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(authState.user));
  } else {
    storage.removeItem(USER_STORAGE_KEY);
  }
}

function emitChange() {
  persistAuthState();
  listeners.forEach((listener) => listener());
}

function updateAuthState(patch: Partial<AuthSnapshot>) {
  authState = {
    ...authState,
    ...patch,
  };
  emitChange();
}

async function parseApiResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message || '请求失败，请稍后重试');
  }

  return payload;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, retry = true } = options;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (authState.accessToken && auth) {
    headers.set('Authorization', `Bearer ${authState.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && auth && retry) {
    const nextAccessToken = await refreshAccessToken();

    if (nextAccessToken) {
      return request<T>(path, init, { auth, retry: false });
    }
  }

  const payload = await parseApiResponse<T>(response);
  return payload.data;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const payload = await request<RefreshResponse>(
          '/api/auth/refresh',
          {
            method: 'POST',
          },
          {
            auth: false,
            retry: false,
          }
        );

        updateAuthState({
          accessToken: payload.accessToken,
        });

        return payload.accessToken;
      } catch {
        clearAuth();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function fetchCurrentUser() {
  return request<MeResponse>('/api/auth/me', {
    method: 'GET',
  });
}

export function getAccessToken() {
  return authState.accessToken;
}

export function isDevBypassToken(token: string | null) {
  return import.meta.env.DEV && token === DEV_BYPASS_TOKEN;
}

export function getCurrentUser() {
  return authState.user;
}

export function setCurrentUser(user: AuthUser | null) {
  updateAuthState({
    user,
  });
}

export function isAuthenticated() {
  return Boolean(authState.accessToken);
}

export function loginWithDevBypass() {
  if (!import.meta.env.DEV) {
    throw new Error('仅开发环境支持快捷登录');
  }

  updateAuthState({
    initialized: true,
    accessToken: DEV_BYPASS_TOKEN,
    user: {
      id: 0,
      username: 'Dev Admin',
      name: '开发管理员',
      email: 'dev@example.com',
      phone: null,
      avatar: null,
      status: 1,
      lastLoginAt: null,
      createdAt: null,
      updatedAt: null,
      roleIds: [0],
      roleNames: ['开发环境'],
    },
  });
}

export function setAuthenticated(value: boolean) {
  if (!value) {
    clearAuth();
  }
}

export async function login(values: { username: string; password: string; remember?: boolean }) {
  const payload = await request<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    {
      auth: false,
      retry: false,
    }
  );

  updateAuthState({
    initialized: true,
    accessToken: payload.accessToken,
    user: payload.user,
  });

  return payload;
}

export async function logout() {
  try {
    await request<null>(
      '/api/auth/logout',
      {
        method: 'POST',
      },
      {
        auth: false,
        retry: false,
      }
    );
  } finally {
    clearAuth();
  }
}

export async function updateMyProfile(values: UpdateProfileRequest) {
  const payload = await request<UpdateProfileResponse>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(values),
  });

  updateAuthState({
    user: payload.user,
  });

  return payload;
}

export async function initializeAuth() {
  if (authState.initialized) {
    return;
  }

  if (!initializePromise) {
    initializePromise = (async () => {
      try {
        if (!authState.accessToken) {
          await refreshAccessToken();
        }

        if (isDevBypassToken(authState.accessToken)) {
          updateAuthState({
            initialized: true,
            user:
              authState.user ??
              ({
                id: 0,
                username: 'Dev Admin',
                name: '开发管理员',
                email: 'dev@example.com',
                avatar: null,
                phone: null,
                status: 1,
                lastLoginAt: null,
                createdAt: null,
                updatedAt: null,
                roleIds: [0],
                roleNames: ['开发环境'],
              } satisfies AuthUser),
          });
          return;
        }

        if (authState.accessToken) {
          const payload = await fetchCurrentUser();
          updateAuthState({
            initialized: true,
            user: payload.user,
          });
          return;
        }

        updateAuthState({
          initialized: true,
          user: null,
        });
      } catch {
        clearAuth();
        updateAuthState({
          initialized: true,
        });
      } finally {
        initializePromise = null;
      }
    })();
  }

  return initializePromise;
}

export function clearAuth() {
  authState = {
    initialized: true,
    accessToken: null,
    user: null,
  };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authState;
}

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
