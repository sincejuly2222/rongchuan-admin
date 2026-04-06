import type { MenuListItem, MenuTreeItem } from '../../api/menus';
import type { MenuRecord, MenuTreeOption, StatusTabKey } from './types';

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', { hour12: false });
}

export function toMenuRecord(item: MenuListItem): MenuRecord {
  return {
    key: item.id,
    id: item.id,
    parentId: item.parent_id,
    parentName: item.parent_name ?? '顶级菜单',
    name: item.menu_name,
    code: item.menu_code,
    path: item.path ?? '-',
    component: item.component ?? '-',
    icon: item.icon ?? '-',
    sortOrder: item.sort_order,
    status: item.status === 1 ? '启用' : '禁用',
    createdAt: formatDateTime(item.created_at),
    updatedAt: formatDateTime(item.updated_at),
  };
}

export function toStatusCountMap(rows: MenuRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

export function toMenuTreeOptions(items: MenuTreeItem[], editingId?: number): MenuTreeOption[] {
  return items.map((item) => ({
    title: item.menu_name,
    value: item.id,
    disabled: item.id === editingId,
    children: item.children.length > 0 ? toMenuTreeOptions(item.children, editingId) : undefined,
  }));
}
