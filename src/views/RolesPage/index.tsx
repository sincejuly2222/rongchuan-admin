import { App, Form } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { fetchPermissions } from '../../api/permissions';
import {
  createRole,
  fetchRolePermissions,
  updateRole,
  updateRolePermissions,
} from '../../api/roles';
import { RoleModals } from './components/RoleModals';
import { RolesTable } from './components/RolesTable';
import type {
  PermissionFormValues,
  PermissionOption,
  RoleFormValues,
  RoleRecord,
  StatusTabKey,
} from './types';
import './index.less';

export function RolesPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [roleForm] = Form.useForm<RoleFormValues>();
  const [permissionForm] = Form.useForm<PermissionFormValues>();
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
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleRecord | null>(null);
  const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);

  useEffect(() => {
    let active = true;

    void fetchPermissions({ current: 1, pageSize: 200 })
      .then((data) => {
        if (!active) {
          return;
        }

        setPermissionOptions(
          data.list.map((item) => ({
            label: `${item.permission_name} (${item.permission_code})`,
            value: item.id,
          })),
        );
      })
      .catch(() => {
        if (active) {
          setPermissionOptions([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

  const openPermissionModal = async (record: RoleRecord) => {
    try {
      const data = await fetchRolePermissions(record.id);
      setCurrentRole(record);
      permissionForm.setFieldsValue({
        permissionIds: data.permissionIds,
      });
      setPermissionModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取角色权限失败');
    }
  };

  const handleSavePermissions = async () => {
    if (!currentRole) {
      return;
    }

    try {
      const values = await permissionForm.validateFields();
      setPermissionSubmitting(true);
      await updateRolePermissions(currentRole.id, {
        permissionIds: values.permissionIds ?? [],
      });
      message.success(`已更新角色 ${currentRole.name} 的权限配置`);
      setPermissionModalOpen(false);
      setCurrentRole(null);
      permissionForm.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setPermissionSubmitting(false);
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
        onPermissionConfig={(record) => {
          void openPermissionModal(record);
        }}
      />

      <RoleModals
        roleForm={roleForm}
        permissionForm={permissionForm}
        currentRole={currentRole}
        editingRole={editingRole}
        permissionOptions={permissionOptions}
        roleModalOpen={roleModalOpen}
        permissionModalOpen={permissionModalOpen}
        roleSubmitting={roleSubmitting}
        permissionSubmitting={permissionSubmitting}
        onRoleOk={() => void handleSubmitRole()}
        onPermissionOk={() => void handleSavePermissions()}
        onRoleCancel={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
          roleForm.resetFields();
        }}
        onPermissionCancel={() => {
          setPermissionModalOpen(false);
          setCurrentRole(null);
          permissionForm.resetFields();
        }}
      />
    </div>
  );
}
