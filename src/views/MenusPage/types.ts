export type MenuStatus = '启用' | '禁用';

export type MenuTreeOption = {
  title: string;
  value: number;
  disabled?: boolean;
  children?: MenuTreeOption[];
};

export type MenuRecord = {
  key: number;
  id: number;
  parentId: number;
  parentName: string;
  name: string;
  code: string;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  status: MenuStatus;
  createdAt: string;
  updatedAt: string;
};

export type StatusTabKey = 'all' | MenuStatus;

export type MenuFormValues = {
  parentId?: number;
  menuName: string;
  menuCode: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder?: number;
  status: MenuStatus;
};
