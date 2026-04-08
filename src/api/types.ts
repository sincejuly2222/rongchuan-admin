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

export type MenuTreeItem = MenuListItem & {
  children: MenuTreeItem[];
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

export type DeleteMenuResponse = {
  id: number;
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

export type AlumniStudentRecord = {
  id: number;
  school: string;
  college: string | null;
  major: string;
  class_name: string | null;
  student_no: string | null;
  enrollment_year: number;
  graduation_year: number | null;
  status: number;
};

export type AlumniCard = {
  id: number;
  slogan: string | null;
  show_phone: number;
  show_wechat: number;
  wechat: string | null;
  need_approval: number;
  allow_search: number;
};

export type AlumniListItem = {
  id: number;
  open_id: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  gender: number | null;
  company: string | null;
  position: string | null;
  city: string | null;
  status: number;
  verified_status: number;
  allow_search: number;
  created_at: string;
  school?: string | null;
  college?: string | null;
  major?: string | null;
  class_name?: string | null;
  enrollment_year?: number | null;
  slogan?: string | null;
};

export type AlumniDetail = AlumniListItem & {
  updated_at: string;
  bio: string | null;
  student_record: AlumniStudentRecord | null;
  card: AlumniCard | null;
};

export type AlumniListResponse = PaginatedResponse<AlumniListItem>;

export type AlumniListParams = {
  current?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
  verifiedStatus?: number | string;
  enrollmentYear?: number | string;
  major?: string;
  className?: string;
  company?: string;
};

export type CreateAlumniRequest = {
  openId?: string | null;
  phone?: string | null;
  name: string;
  avatar?: string | null;
  gender?: number | null;
  company?: string | null;
  position?: string | null;
  city?: string | null;
  bio?: string | null;
  status?: number;
  verifiedStatus?: number;
  allowSearch?: number;
};

export type UpdateAlumniRequest = Partial<CreateAlumniRequest> & {
  name?: string;
};

export type UpdateAlumniStatusResponse = {
  id: number;
  status: 0 | 1;
};

export type UpsertStudentRecordRequest = {
  school: string;
  college?: string | null;
  major: string;
  className?: string | null;
  studentNo?: string | null;
  enrollmentYear: number;
  graduationYear?: number | null;
  status?: number;
};

export type UpsertCardRequest = {
  slogan?: string | null;
  showPhone?: number;
  showWechat?: number;
  wechat?: string | null;
  needApproval?: number;
  allowSearch?: number;
};

export type StudentRecordListItem = {
  id: number;
  user_id: number;
  name: string;
  phone: string | null;
  school: string;
  college: string | null;
  major: string;
  class_name: string | null;
  student_no: string | null;
  enrollment_year: number;
  graduation_year: number | null;
  status: number;
  created_at: string;
  updated_at: string;
};

export type StudentRecordListResponse = PaginatedResponse<StudentRecordListItem>;

export type StudentRecordListParams = {
  current?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
  enrollmentYear?: number | string;
  major?: string;
};

export type UpdateStudentRecordStatusResponse = {
  id: number;
  status: 0 | 1 | 2;
};

export type ImportJobItem = {
  id: number;
  name: string;
  type: string;
  operator_name: string;
  status: number;
  total_count: number;
  success_count: number;
  failed_count: number;
  error_details: Array<{ row: number; message: string }> | null;
  created_at: string;
  updated_at: string;
};

export type ImportJobListResponse = PaginatedResponse<ImportJobItem>;

export type ImportJobListParams = {
  current?: number;
  pageSize?: number;
  type?: string;
  status?: number | string;
};

export type OrganizationItem = {
  id: number;
  name: string;
  type: string;
  principal: string | null;
  city: string | null;
  member_count: number;
  pending_count: number;
  active_count: number;
  founded_at: string | null;
  status: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationListResponse = PaginatedResponse<OrganizationItem>;

export type OrganizationListParams = {
  current?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: number | string;
  city?: string;
};

export type CreateOrganizationRequest = {
  name: string;
  type: string;
  principal?: string | null;
  city?: string | null;
  memberCount?: number;
  pendingCount?: number;
  activeCount?: number;
  foundedAt?: string | null;
  status?: number;
  description?: string | null;
};

export type UpdateOrganizationRequest = CreateOrganizationRequest;

export type UpdateOrganizationStatusResponse = {
  id: number;
  status: 0 | 1;
};

export type ActivityItem = {
  id: number;
  name: string;
  type: string;
  organization_id: number | null;
  organization_name: string | null;
  city: string | null;
  venue: string | null;
  start_time: string;
  end_time: string | null;
  capacity: number;
  enrollments: number;
  status: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityListResponse = PaginatedResponse<ActivityItem>;

export type ActivityListParams = {
  current?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: number | string;
  city?: string;
  organizationId?: number | string;
};

export type CreateActivityRequest = {
  name: string;
  type: string;
  organizationId?: number | null;
  city?: string | null;
  venue?: string | null;
  startTime: string;
  endTime?: string | null;
  capacity?: number;
  enrollments?: number;
  status?: number;
  description?: string | null;
};

export type UpdateActivityRequest = CreateActivityRequest;

export type UpdateActivityStatusResponse = {
  id: number;
  status: 0 | 1 | 2;
};
