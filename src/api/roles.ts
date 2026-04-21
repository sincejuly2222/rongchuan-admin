import { getAccessToken, isDevBypassToken, logout } from '../auth';
import type {
  ApiResponse,
  CreateRoleRequest,
  RoleMenusResponse,
  RoleListItem,
  RoleListParams,
  RoleListResponse,
  UpdateRoleMenusRequest,
  UpdateRoleRequest,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type {
  CreateRoleRequest,
  RoleMenusResponse,
  RoleListItem,
  RoleListParams,
  RoleListResponse,
  UpdateRoleMenusRequest,
  UpdateRoleRequest,
};

const mockRoles: RoleListItem[] = [
  {
    id: 1,
    role_name: '超级管理员',
    role_code: 'SUPER_ADMIN',
    description: '拥有系统全部权限',
    status: 1,
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-04-03T14:00:00.000Z',
    member_count: 2,
    menu_count: 12,
  },
  {
    id: 2,
    role_name: '运营管理员',
    role_code: 'OPERATOR',
    description: '负责日常运营和活动配置',
    status: 1,
    created_at: '2026-03-05T10:30:00.000Z',
    updated_at: '2026-04-03T10:28:00.000Z',
    member_count: 5,
    menu_count: 6,
  },
];

function getMockRoles(params: RoleListParams): RoleListResponse {
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

  const filtered = mockRoles.filter((item) => {
    const matchName = params.roleName ? item.role_name.includes(params.roleName) : true;
    const matchCode = params.roleCode ? item.role_code.includes(params.roleCode) : true;
    const matchStatus = normalizedStatus === undefined ? true : item.status === normalizedStatus;
    return matchName && matchCode && matchStatus;
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

const mockRoleMenus = new Map<number, number[]>([
  [1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
  [2, [1, 7, 8, 9, 10, 11, 12]],
]);

export async function fetchRoles(params: RoleListParams) {
  if (isDevBypassToken(getAccessToken())) {
    return getMockRoles(params);
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/roles?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<RoleListResponse>(response, '获取角色列表失败');
}

export async function createRole(params: CreateRoleRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const nextRole: RoleListItem = {
      id: mockRoles.length + 1,
      role_name: params.roleName,
      role_code: params.roleCode,
      description: params.description ?? null,
      status: params.status ?? 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 0,
      menu_count: 0,
    };

    mockRoles.unshift(nextRole);
    return nextRole;
  }

  const response = await fetch(`${API_BASE_URL}/api/roles`, {
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

  return parseResponse<RoleListItem>(response, '新增角色失败');
}

export async function updateRole(id: number, params: UpdateRoleRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockRoles.find((item) => item.id === id);

    if (!target) {
      throw new Error('角色不存在');
    }

    target.role_name = params.roleName;
    target.role_code = params.roleCode;
    target.description = params.description ?? null;
    target.status = params.status ?? target.status;
    target.updated_at = new Date().toISOString();

    return target;
  }

  const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
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

  return parseResponse<RoleListItem>(response, '更新角色失败');
}

export async function fetchRoleMenus(roleId: number) {
  if (isDevBypassToken(getAccessToken())) {
    return {
      roleId,
      menuIds: mockRoleMenus.get(roleId) ?? [],
    } satisfies RoleMenusResponse;
  }

  const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/menus`, {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<RoleMenusResponse>(response, '获取角色菜单失败');
}

export async function updateRoleMenus(roleId: number, params: UpdateRoleMenusRequest) {
  if (isDevBypassToken(getAccessToken())) {
    mockRoleMenus.set(roleId, params.menuIds);

    const target = mockRoles.find((item) => item.id === roleId);
    if (target) {
      target.menu_count = params.menuIds.length;
    }

    return {
      roleId,
      menuIds: params.menuIds,
    } satisfies RoleMenusResponse;
  }

  const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/menus`, {
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

  return parseResponse<RoleMenusResponse>(response, '更新角色菜单失败');
}
