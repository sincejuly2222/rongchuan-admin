export type RoleStatus = '启用' | '禁用';

export type RoleRecord = {
  key: number;
  id: number;
  name: string;
  code: string;
  description: string;
  memberCount: number;
  permissionCount: number;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
};

export type StatusTabKey = 'all' | RoleStatus;

export type RoleFormValues = {
  roleName: string;
  roleCode: string;
  description?: string;
  status: RoleStatus;
};

export type PermissionFormValues = {
  permissionIds: number[];
};

export type PermissionOption = {
  label: string;
  value: number;
};
