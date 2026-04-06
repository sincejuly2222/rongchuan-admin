import type { UserListItem } from '../../api/users';
import type { StatusTabKey, UserRecord } from './types';

export function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

export function toStatusCountMap(rows: UserRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

export function toUserRecord(item: UserListItem, roleNameToIdMap: Map<string, number>): UserRecord {
  const roleIds = (item.role_names ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((name) => roleNameToIdMap.get(name))
    .filter((value): value is number => typeof value === 'number');

  return {
    key: item.id,
    id: item.id,
    name: item.name,
    account: item.username,
    email: item.email,
    phone: item.phone,
    role: item.role_names ?? '未分配',
    roleIds,
    status: item.status === 1 ? '启用' : '禁用',
    lastLogin: formatDateTime(item.last_login_at),
    createdAt: formatDateTime(item.created_at),
  };
}
