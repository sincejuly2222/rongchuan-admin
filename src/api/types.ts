export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  errors?: unknown;
};

export type PaginatedResponse<T> = {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
};

export type AuthUser = {
  id: number;
  username: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: number;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  roleIds: number[];
  roleNames: string[];
};

export type LoginRequest = {
  username: string;
  password: string;
  remember?: boolean;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
};

export type RegisterResponse = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
};

export type RefreshResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export type MeResponse = {
  user: AuthUser;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
};

export type UpdateProfileResponse = {
  user: AuthUser;
};

export type HealthResponse = {
  database: string;
  timestamp: string;
};

export type UserListItem = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: number;
  last_login_at: string | null;
  created_at: string;
  role_names: string | null;
};

export type UserDetail = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  role_names: string;
  role_ids: number[];
};

export type UserListResponse = PaginatedResponse<UserListItem>;

export type UserListParams = {
  current?: number;
  pageSize?: number;
  username?: string;
  name?: string;
  status?: string | number;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  name?: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status?: number;
  roleIds?: number[];
};

export type UpdateUserRequest = {
  username: string;
  email: string;
  password?: string;
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  status?: number;
  roleIds?: number[];
};

export type UpdateUserStatusRequest = {
  status: 0 | 1;
};

export type UpdateUserStatusResponse = {
  id: number;
  status: 0 | 1;
};

export type RoleListItem = {
  id: number;
  role_name: string;
  role_code: string;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  permission_count: number;
};

export type RoleListResponse = PaginatedResponse<RoleListItem>;

export type RoleListParams = {
  current?: number;
  pageSize?: number;
  roleName?: string;
  roleCode?: string;
  status?: string | number;
};

export type RolePermissionsResponse = {
  roleId: number;
  permissionIds: number[];
};

export type UpdateRolePermissionsRequest = {
  permissionIds: number[];
};

export type CreateRoleRequest = {
  roleName: string;
  roleCode: string;
  description?: string | null;
  status?: number;
};

export type UpdateRoleRequest = CreateRoleRequest;

export type MenuListItem = {
  id: number;
  parent_id: number;
  parent_name: string | null;
  menu_name: string;
  menu_code: string;
  path: string | null;
  component: string | null;
  icon: string | null;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
};

export type MenuListResponse = PaginatedResponse<MenuListItem>;

export type MenuListParams = {
  current?: number;
  pageSize?: number;
  menuName?: string;
  status?: string | number;
};

export type CreateMenuRequest = {
  parentId?: number;
  menuName: string;
  menuCode: string;
  path?: string | null;
  component?: string | null;
  icon?: string | null;
  sortOrder?: number;
  status?: number;
};

export type UpdateMenuRequest = CreateMenuRequest;

export type UpdateMenuStatusRequest = {
  status: 0 | 1;
};

export type UpdateMenuStatusResponse = {
  id: number;
  status: 0 | 1;
};

export type PermissionListItem = {
  id: number;
  permission_code: string;
  permission_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  role_count: number;
};

export type PermissionListResponse = PaginatedResponse<PermissionListItem>;

export type PermissionListParams = {
  current?: number;
  pageSize?: number;
  permissionCode?: string;
  permissionName?: string;
};

export type CreatePermissionRequest = {
  permissionCode: string;
  permissionName: string;
  description?: string | null;
};

export type UpdatePermissionRequest = CreatePermissionRequest;
