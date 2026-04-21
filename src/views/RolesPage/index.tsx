import { App, Form } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import type { DataNode } from 'antd/es/tree';
import { useEffect, useRef, useState } from 'react';
import { fetchMenuTree, type MenuTreeItem } from '../../api/menus';
import {
  createRole,
  fetchRoleMenus,
  updateRole,
  updateRoleMenus,
} from '../../api/roles';
import { RoleModals } from './components/RoleModals';
import { RolesTable } from './components/RolesTable';
import type {
  MenuFormValues,
  RoleFormValues,
  RoleRecord,
  StatusTabKey,
} from './types';
import './index.less';

export function RolesPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [roleForm] = Form.useForm<RoleFormValues>();
  const [menuForm] = Form.useForm<MenuFormValues>();
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<RoleRecord[]>([]);
  const [summary, setSummary] = useState<Record<StatusTabKey, number>>({
    all: 0,
    启用: 0,
    禁用: 0,
  });
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuSubmitting, setMenuSubmitting] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleRecord | null>(null);
  const [menuTree, setMenuTree] = useState<MenuTreeItem[]>([]);

  useEffect(() => {
    let active = true;

    void fetchMenuTree({ scope: 'all' })
      .then((data) => {
        if (active) {
          setMenuTree(data);
        }
      })
      .catch(() => {
        if (active) {
          setMenuTree([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const buildMenuTreeData = (items: MenuTreeItem[]): DataNode[] =>
    items.map((item) => ({
      key: item.id,
      title: item.path ? `${item.menu_name} (${item.path})` : item.menu_name,
      children: buildMenuTreeData(item.children),
    }));

  const collectMenuIdsWithParents = (menuIds: number[]) => {
    const selectedIds = new Set(menuIds);

    const walk = (items: MenuTreeItem[], parents: number[]) => {
      items.forEach((item) => {
        if (selectedIds.has(item.id)) {
          parents.forEach((parentId) => selectedIds.add(parentId));
        }

        walk(item.children, [...parents, item.id]);
      });
    };

    walk(menuTree, []);
    return [...selectedIds];
  };

  const openCreateModal = () => {
    setEditingRole(null);
    roleForm.resetFields();
    roleForm.setFieldsValue({
      status: '启用',
    });
    setRoleModalOpen(true);
  };

  const openEditModal = (record: RoleRecord) => {
    setEditingRole(record);
    roleForm.setFieldsValue({
      roleName: record.name,
      roleCode: record.code,
      description: record.description === '-' ? '' : record.description,
      status: record.status,
    });
    setRoleModalOpen(true);
  };

  const handleSubmitRole = async () => {
    try {
      const values = await roleForm.validateFields();
      setRoleSubmitting(true);

      if (editingRole) {
        await updateRole(editingRole.id, {
          roleName: values.roleName.trim(),
          roleCode: values.roleCode.trim(),
          description: values.description?.trim() || null,
          status: values.status === '启用' ? 1 : 0,
        });
        message.success(`已更新角色 ${values.roleName}`);
      } else {
        await createRole({
          roleName: values.roleName.trim(),
          roleCode: values.roleCode.trim(),
          description: values.description?.trim() || null,
          status: values.status === '启用' ? 1 : 0,
        });
        message.success(`已新增角色 ${values.roleName}`);
      }

      setRoleModalOpen(false);
      setEditingRole(null);
      roleForm.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setRoleSubmitting(false);
    }
  };

  const openMenuModal = async (record: RoleRecord) => {
    try {
      const data = await fetchRoleMenus(record.id);
      setCurrentRole(record);
      menuForm.setFieldsValue({
        menuIds: data.menuIds,
      });
      setMenuModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取角色菜单失败');
    }
  };

  const handleSaveMenus = async () => {
    if (!currentRole) {
      return;
    }

    try {
      const menuIds = menuForm.getFieldValue('menuIds') ?? [];
      setMenuSubmitting(true);
      await updateRoleMenus(currentRole.id, {
        menuIds: collectMenuIdsWithParents(menuIds),
      });
      message.success(`已更新角色 ${currentRole.name} 的菜单配置`);
      setMenuModalOpen(false);
      setCurrentRole(null);
      menuForm.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setMenuSubmitting(false);
    }
  };

  return (
    <div className="page-root">
      <RolesTable
        actionRef={actionRef}
        activeTab={activeTab}
        summary={summary}
        selectedRows={selectedRows}
        setActiveTab={setActiveTab}
        setSelectedRows={setSelectedRows}
        setSummary={setSummary}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onMenuConfig={(record) => {
          void openMenuModal(record);
        }}
      />

      <RoleModals
        roleForm={roleForm}
        menuForm={menuForm}
        currentRole={currentRole}
        editingRole={editingRole}
        menuTreeData={buildMenuTreeData(menuTree)}
        roleModalOpen={roleModalOpen}
        menuModalOpen={menuModalOpen}
        roleSubmitting={roleSubmitting}
        menuSubmitting={menuSubmitting}
        onRoleOk={() => void handleSubmitRole()}
        onMenuOk={() => void handleSaveMenus()}
        onRoleCancel={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
          roleForm.resetFields();
        }}
        onMenuCancel={() => {
          setMenuModalOpen(false);
          setCurrentRole(null);
          menuForm.resetFields();
        }}
      />
    </div>
  );
}
