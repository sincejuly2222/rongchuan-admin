import type { PermissionListItem } from '../../api/permissions';
import type { PermissionRecord } from './types';

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

export function toPermissionRecord(item: PermissionListItem): PermissionRecord {
  return {
    key: item.id,
    id: item.id,
    code: item.permission_code,
    name: item.permission_name,
    description: item.description ?? '-',
    roleCount: item.role_count,
    createdAt: formatDateTime(item.created_at),
    updatedAt: formatDateTime(item.updated_at),
  };
}
