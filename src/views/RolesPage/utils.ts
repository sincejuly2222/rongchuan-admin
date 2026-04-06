import type { RoleListItem } from '../../api/roles';
import type { RoleRecord, StatusTabKey } from './types';

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

export function toStatusCountMap(rows: RoleRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

export function toRoleRecord(item: RoleListItem): RoleRecord {
  return {
    key: item.id,
    id: item.id,
    name: item.role_name,
    code: item.role_code,
    description: item.description ?? '-',
    memberCount: item.member_count,
    permissionCount: item.permission_count,
    status: item.status === 1 ? '启用' : '禁用',
    createdAt: formatDateTime(item.created_at),
    updatedAt: formatDateTime(item.updated_at),
  };
}
