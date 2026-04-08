import { getAccessToken, isDevBypassToken, logout } from '../auth';
import type {
  ApiResponse,
  CreateMenuRequest,
  DeleteMenuResponse,
  MenuListItem,
  MenuListParams,
  MenuListResponse,
  MenuTreeItem,
  UpdateMenuRequest,
  UpdateMenuStatusResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type {
  CreateMenuRequest,
  DeleteMenuResponse,
  MenuListItem,
  MenuListParams,
  MenuListResponse,
  MenuTreeItem,
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
  {
    id: 3,
    parent_id: 0,
    parent_name: null,
    menu_name: '角色管理',
    menu_code: 'roles',
    path: '/roles',
    component: 'views/RolesPage',
    icon: 'SafetyOutlined',
    sort_order: 30,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 4,
    parent_id: 0,
    parent_name: null,
    menu_name: '权限管理',
    menu_code: 'permissions',
    path: '/permissions',
    component: 'views/PermissionsPage',
    icon: 'SafetyCertificateOutlined',
    sort_order: 40,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 5,
    parent_id: 0,
    parent_name: null,
    menu_name: '菜单管理',
    menu_code: 'menus',
    path: '/menus',
    component: 'views/MenusPage',
    icon: 'MenuOutlined',
    sort_order: 50,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 6,
    parent_id: 0,
    parent_name: null,
    menu_name: '个人中心',
    menu_code: 'profile',
    path: '/profile',
    component: 'views/ProfilePage',
    icon: 'ProfileOutlined',
    sort_order: 60,
    status: 1,
    created_at: '2026-04-03T09:00:00.000Z',
    updated_at: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 7,
    parent_id: 0,
    parent_name: null,
    menu_name: '校友业务',
    menu_code: 'alumni_services',
    path: null,
    component: null,
    icon: 'TeamOutlined',
    sort_order: 70,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
  {
    id: 8,
    parent_id: 7,
    parent_name: '校友业务',
    menu_name: '校友管理',
    menu_code: 'alumni',
    path: '/alumni',
    component: 'views/AlumniPage',
    icon: 'TeamOutlined',
    sort_order: 71,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
  {
    id: 9,
    parent_id: 7,
    parent_name: '校友业务',
    menu_name: '学籍管理',
    menu_code: 'student_status',
    path: '/student-status',
    component: 'views/StudentStatusPage',
    icon: 'ReadOutlined',
    sort_order: 72,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
  {
    id: 10,
    parent_id: 7,
    parent_name: '校友业务',
    menu_name: 'Excel 批量导入',
    menu_code: 'excel_import',
    path: '/excel-import',
    component: 'views/ExcelImportPage',
    icon: 'FileExcelOutlined',
    sort_order: 73,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
  {
    id: 11,
    parent_id: 7,
    parent_name: '校友业务',
    menu_name: '活动管理',
    menu_code: 'activities',
    path: '/activities',
    component: 'views/ActivitiesPage',
    icon: 'CalendarOutlined',
    sort_order: 74,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
  {
    id: 12,
    parent_id: 7,
    parent_name: '校友业务',
    menu_name: '组织管理',
    menu_code: 'organizations',
    path: '/organizations',
    component: 'views/OrganizationsPage',
    icon: 'ApartmentOutlined',
    sort_order: 75,
    status: 1,
    created_at: '2026-04-08T09:00:00.000Z',
    updated_at: '2026-04-08T09:00:00.000Z',
  },
];

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

async function ensureAuthorized(response: Response) {
  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }
}

function getNextMockId() {
  return mockMenus.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

function buildMockMenuTree(items: MenuListItem[]): MenuTreeItem[] {
  const menuMap = new Map<number, MenuTreeItem>();

  items.forEach((item) => {
    menuMap.set(item.id, {
      ...item,
      children: [],
    });
  });

  const roots: MenuTreeItem[] = [];

  menuMap.forEach((item) => {
    if (item.parent_id > 0) {
      const parent = menuMap.get(item.parent_id);
      if (parent) {
        parent.children.push(item);
        return;
      }
    }

    roots.push(item);
  });

  return roots;
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

  await ensureAuthorized(response);

  return parseResponse<MenuListResponse>(response, '获取菜单列表失败');
}

export async function fetchMenuTree() {
  if (isDevBypassToken(getAccessToken())) {
    return buildMockMenuTree(mockMenus);
  }

  const response = await fetch(`${API_BASE_URL}/api/menus/tree`, {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  await ensureAuthorized(response);

  return parseResponse<MenuTreeItem[]>(response, '获取菜单树失败');
}

export async function createMenu(params: CreateMenuRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const parentMenu =
      params.parentId && params.parentId > 0
        ? mockMenus.find((item) => item.id === params.parentId)
        : null;

    const nextMenu: MenuListItem = {
      id: getNextMockId(),
      parent_id: params.parentId ?? 0,
      parent_name: parentMenu?.menu_name ?? null,
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

  await ensureAuthorized(response);

  return parseResponse<MenuListItem>(response, '新增菜单失败');
}

export async function updateMenu(id: number, params: UpdateMenuRequest) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockMenus.find((item) => item.id === id);

    if (!target) {
      throw new Error('菜单不存在');
    }

    const parentMenu =
      params.parentId && params.parentId > 0
        ? mockMenus.find((item) => item.id === params.parentId)
        : null;

    target.parent_id = params.parentId ?? 0;
    target.parent_name = parentMenu?.menu_name ?? null;
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

  await ensureAuthorized(response);

  return parseResponse<MenuListItem>(response, '编辑菜单失败');
}

export async function updateMenuStatus(id: number, status: number) {
  if (isDevBypassToken(getAccessToken())) {
    const target = mockMenus.find((item) => item.id === id);

    if (target) {
      target.status = status;
      target.updated_at = new Date().toISOString();
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

  await ensureAuthorized(response);

  return parseResponse<UpdateMenuStatusResponse>(response, '更新菜单状态失败');
}

export async function deleteMenu(id: number) {
  if (isDevBypassToken(getAccessToken())) {
    const index = mockMenus.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error('菜单不存在');
    }

    const hasChildren = mockMenus.some((item) => item.parent_id === id);
    if (hasChildren) {
      throw new Error('当前菜单存在子菜单，不能直接删除');
    }

    mockMenus.splice(index, 1);
    return { id } satisfies DeleteMenuResponse;
  }

  const response = await fetch(`${API_BASE_URL}/api/menus/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
    credentials: 'include',
  });

  await ensureAuthorized(response);

  return parseResponse<DeleteMenuResponse>(response, '删除菜单失败');
}
