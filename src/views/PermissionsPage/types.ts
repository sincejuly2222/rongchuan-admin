export type PermissionRecord = {
  key: number;
  id: number;
  code: string;
  name: string;
  description: string;
  roleCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PermissionTabKey = 'all';

export type PermissionFormValues = {
  permissionCode: string;
  permissionName: string;
  description?: string;
};
