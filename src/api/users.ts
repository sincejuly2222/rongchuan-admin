import { getAccessToken, isDevBypassToken, logout } from '../auth';
import type {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusResponse,
  UserDetail,
  UserListItem,
  UserListParams,
  UserListResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type {
  CreateUserRequest as CreateUserParams,
  UpdateUserRequest as UpdateUserParams,
  UserDetail,
  UserListItem,
  UserListParams,
  UserListResponse,
};

const mockUsers: UserDetail[] = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@rongchuan.local',
    phone: '13800000001',
    avatar: null,
    status: 1,
    last_login_at: '2026-04-03T14:20:00.000Z',
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-04-03T14:20:00.000Z',
    role_names: '超级管理员',
    role_ids: [1],
  },
  {
    id: 2,
    username: 'liqing',
    name: '李青',
    email: 'liqing@rongchuan.local',
    phone: '13800000002',
    avatar: null,
    status: 1,
    last_login_at: '2026-04-03T11:18:00.000Z',
    created_at: '2026-03-05T10:30:00.000Z',
    updated_at: '2026-04-03T11:18:00.000Z',
    role_names: '运营管理员',
    role_ids: [2],
  },
];

function normalizeUserListItem(item: UserDetail): UserListItem {
  return {
    id: item.id,
    username: item.username,
    name: item.name,
    email: item.email,
    phone: item.phone,
    avatar: item.avatar,
    status: item.status,
    last_login_at: item.last_login_at,
    created_at: item.created_at,
    role_names: item.role_names,
  };
}

function getMockUsers(params: UserListParams): UserListResponse {
  const pageSize = params.pageSize ?? 10;
  const current = params.current ?? 1;
  const normalizedStatus =
    params.status === '启用'
      ? 1
      : params.status === '禁用'
        ? 0
        : typeof params.status === 'number'
          ? params.status
          : undefined;

  const filtered = mockUsers.filter((item) => {
    const matchUsername = params.username
      ? item.username.toLowerCase().includes(params.username.toLowerCase())
      : true;
    const matchName = params.name
      ? item.name.toLowerCase().includes(params.name.toLowerCase())
      : true;
    const matchStatus = normalizedStatus === undefined ? true : item.status === normalizedStatus;

    return matchUsername && matchName && matchStatus;
  });

  const start = (current - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize).map(normalizeUserListItem);

  return {
    list,
    total: filtered.length,
    current,
    pageSize,
  };
}

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

function withAuthHeaders(init?: HeadersInit) {
  return {
    ...(init ?? {}),
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchUsers(params: UserListParams) {
  if (isDevBypassToken(getAccessToken())) {
    return getMockUsers(params);
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/users?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<UserListResponse>(response, '获取用户列表失败');
}

export async function createUser(params: CreateUserRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const nextUser: UserDetail = {
      id: mockUsers.length + 1,
      username: params.username,
      name: params.name ?? params.username,
      email: params.email,
      phone: params.phone ?? null,
      avatar: params.avatar ?? null,
      status: params.status ?? 1,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_names: '',
      role_ids: params.roleIds ?? [],
    };

    mockUsers.unshift(nextUser);
    return nextUser;
  }

  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<UserDetail>(response, '新增用户失败');
}

export async function updateUser(id: number, params: UpdateUserRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockUsers.find((item) => item.id === id);

    if (!target) {
      throw new Error('用户不存在');
    }

    if (params.username !== undefined) target.username = params.username;
    if (params.name !== undefined) target.name = params.name;
    if (params.email !== undefined) target.email = params.email;
    if (params.phone !== undefined) target.phone = params.phone ?? null;
    if (params.avatar !== undefined) target.avatar = params.avatar ?? null;
    if (params.status !== undefined) target.status = params.status;
    if (params.roleIds !== undefined) target.role_ids = params.roleIds;
    target.updated_at = new Date().toISOString();

    return target;
  }

  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<UserDetail>(response, '更新用户失败');
}

export async function updateUserStatus(id: number, status: number) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockUsers.find((item) => item.id === id);
    if (target) {
      target.status = status;
      target.updated_at = new Date().toISOString();
    }
    return { id, status: status === 1 ? 1 : 0 } satisfies UpdateUserStatusResponse;
  }

  const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<UpdateUserStatusResponse>(response, '更新用户状态失败');
}
