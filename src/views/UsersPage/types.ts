export type UserStatus = '启用' | '禁用';

export type UserRecord = {
  key: number;
  id: number;
  name: string;
  account: string;
  email: string | null;
  phone: string | null;
  role: string;
  roleIds: number[];
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
};

export type StatusTabKey = 'all' | UserStatus;

export type CreateUserFormValues = {
  username: string;
  name: string;
  password: string;
  email: string;
  phone?: string;
  roleIds?: number[];
  status: UserStatus;
};

export type EditUserFormValues = Omit<CreateUserFormValues, 'password'>;

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type RoleOption = {
  label: string;
  value: number;
  code: string;
};
