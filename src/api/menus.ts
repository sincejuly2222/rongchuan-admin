import { getAccessToken, isDevBypassToken, logout } from '../auth';
import type {
  ApiResponse,
  CreateMenuRequest,
  MenuListItem,
  MenuListParams,
  MenuListResponse,
  UpdateMenuRequest,
  UpdateMenuStatusResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type {
  CreateMenuRequest,
  MenuListItem,
  MenuListParams,
  MenuListResponse,
  UpdateMenuRequest,
};

const mockMenus: MenuListItem[] = [
  {
    id: 1,
    parent_id: 0,
    parent_name: null,
    menu_name: '工作台',
    menu_code: 'dashboard',
    path: '/dashboard',
    component: 'views/DashboardPage',
    icon: 'DashboardOutlined',
    sort_order: 10,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 2,
    parent_id: 0,
    parent_name: null,
    menu_name: '用户管理',
    menu_code: 'users',
    path: '/users',
    component: 'views/UsersPage',
    icon: 'UserOutlined',
    sort_order: 20,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
];

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

function getMockMenus(params: MenuListParams): MenuListResponse {
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

  const filtered = mockMenus.filter((item) => {
    const matchName = params.menuName ? item.menu_name.includes(params.menuName) : true;
    const matchStatus = normalizedStatus === undefined ? true : item.status === normalizedStatus;
    return matchName && matchStatus;
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

export async function fetchMenus(params: MenuListParams) {
  if (isDevBypassToken(getAccessToken())) {
    return getMockMenus(params);
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/menus?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<MenuListResponse>(response, '获取菜单列表失败');
}

export async function createMenu(params: CreateMenuRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const nextMenu: MenuListItem = {
      id: mockMenus.length + 1,
      parent_id: params.parentId ?? 0,
      parent_name: null,
      menu_name: params.menuName,
      menu_code: params.menuCode,
      path: params.path ?? null,
      component: params.component ?? null,
      icon: params.icon ?? null,
      sort_order: params.sortOrder ?? 0,
      status: params.status ?? 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockMenus.push(nextMenu);
    return nextMenu;
  }

  const response = await fetch(`${API_BASE_URL}/api/menus`, {
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

  return parseResponse<MenuListItem>(response, '新增菜单失败');
}

export async function updateMenu(id: number, params: UpdateMenuRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockMenus.find((item) => item.id === id);

    if (!target) {
      throw new Error('菜单不存在');
    }

    target.parent_id = params.parentId ?? 0;
    target.menu_name = params.menuName;
    target.menu_code = params.menuCode;
    target.path = params.path ?? null;
    target.component = params.component ?? null;
    target.icon = params.icon ?? null;
    target.sort_order = params.sortOrder ?? 0;
    target.status = params.status ?? target.status;
    target.updated_at = new Date().toISOString();

    return target;
  }

  const response = await fetch(`${API_BASE_URL}/api/menus/${id}`, {
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

  return parseResponse<MenuListItem>(response, '编辑菜单失败');
}

export async function updateMenuStatus(id: number, status: number) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockMenus.find((item) => item.id === id);
    if (target) {
      target.status = status;
    }
    return { id, status: status === 1 ? 1 : 0 } satisfies UpdateMenuStatusResponse;
  }

  const response = await fetch(`${API_BASE_URL}/api/menus/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }

  return parseResponse<UpdateMenuStatusResponse>(response, '更新菜单状态失败');
}
