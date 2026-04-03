import { getAccessToken, isDevBypassToken, logout } from '../auth';
import type {
  ApiResponse,
  CreatePermissionRequest,
  PermissionListItem,
  PermissionListParams,
  PermissionListResponse,
  UpdatePermissionRequest,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type {
  CreatePermissionRequest,
  PermissionListItem,
  PermissionListParams,
  PermissionListResponse,
  UpdatePermissionRequest,
};

const mockPermissions: PermissionListItem[] = [
  {
    id: 1,
    permission_code: 'user:list',
    permission_name: '查看用户',
    description: '允许查看用户列表',
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-03-01T09:00:00.000Z',
    role_count: 2,
  },
  {
    id: 2,
    permission_code: 'role:list',
    permission_name: '查看角色',
    description: '允许查看角色列表',
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-03-01T09:00:00.000Z',
    role_count: 2,
  },
];

function getMockPermissions(params: PermissionListParams): PermissionListResponse {
  const pageSize = params.pageSize ?? 10;
  const current = params.current ?? 1;
  const filtered = mockPermissions.filter((item) => {
    const matchCode = params.permissionCode
      ? item.permission_code.includes(params.permissionCode)
      : true;
    const matchName = params.permissionName
      ? item.permission_name.includes(params.permissionName)
      : true;
    return matchCode && matchName;
  });

  const start = (current - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

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

export async function fetchPermissions(params: PermissionListParams) {
  if (isDevBypassToken(getAccessToken())) {
    return getMockPermissions(params);
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/permissions?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<PermissionListResponse>(response, '获取权限列表失败');
}

export async function createPermission(params: CreatePermissionRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const nextPermission: PermissionListItem = {
      id: mockPermissions.length + 1,
      permission_code: params.permissionCode,
      permission_name: params.permissionName,
      description: params.description ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_count: 0,
    };

    mockPermissions.unshift(nextPermission);
    return nextPermission;
  }

  const response = await fetch(`${API_BASE_URL}/api/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<PermissionListItem>(response, '新增权限失败');
}

export async function updatePermission(id: number, params: UpdatePermissionRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockPermissions.find((item) => item.id === id);

    if (!target) {
      throw new Error('权限不存在');
    }

    target.permission_code = params.permissionCode;
    target.permission_name = params.permissionName;
    target.description = params.description ?? null;
    target.updated_at = new Date().toISOString();

    return target;
  }

  const response = await fetch(`${API_BASE_URL}/api/permissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<PermissionListItem>(response, '编辑权限失败');
}
