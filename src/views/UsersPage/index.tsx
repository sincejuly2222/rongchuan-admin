import { App, Form } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { fetchRoles } from '../../api/roles';
import { createUser, deleteUser, updateUser, updateUserStatus } from '../../api/users';
import { UserModals } from './components/UserModals';
import { UsersTable } from './components/UsersTable';
import type {
  CreateUserFormValues,
  EditUserFormValues,
  ResetPasswordFormValues,
  RoleOption,
  StatusTabKey,
  UserRecord,
} from './types';
import './index.less';

export function UsersPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [createForm] = Form.useForm<CreateUserFormValues>();
  const [editForm] = Form.useForm<EditUserFormValues>();
  const [resetPasswordForm] = Form.useForm<ResetPasswordFormValues>();
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<UserRecord[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<UserRecord | null>(null);
  const [summary, setSummary] = useState<Record<StatusTabKey, number>>({
    all: 0,
    启用: 0,
    禁用: 0,
  });
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  useEffect(() => {
    let active = true;

    void fetchRoles({ current: 1, pageSize: 100 })
      .then((data) => {
        if (!active) {
          return;
        }

        setRoleOptions(
          data.list.map((item) => ({
            label: item.role_name,
            value: item.id,
            code: item.role_code,
          })),
        );
      })
      .catch(() => {
        if (active) {
          setRoleOptions([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const roleNameToIdMap = useMemo(
    () => new Map(roleOptions.map((item) => [item.label, item.value])),
    [roleOptions],
  );
  const superAdminRoleIds = useMemo(
    () => new Set(roleOptions.filter((item) => item.code === 'SUPER_ADMIN').map((item) => item.value)),
    [roleOptions],
  );

  const handleStatusChange = async (record: UserRecord, checked: boolean) => {
    try {
      await updateUserStatus(record.id, checked ? 1 : 0);
      message.success(`已${checked ? '启用' : '禁用'}用户 ${record.account}`);
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新用户状态失败');
    }
  };

  const handleDeleteUser = async (record: UserRecord) => {
    try {
      await deleteUser(record.id);
      message.success(`已删除用户 ${record.account}`);
      setSelectedRows((rows) => rows.filter((item) => item.id !== record.id));
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除用户失败');
    }
  };

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      setCreating(true);
      await createUser({
        username: values.username.trim(),
        name: values.name.trim(),
        password: values.password,
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        roleIds: values.roleIds ?? [],
        status: values.status === '启用' ? 1 : 0,
      });

      message.success(`已新增用户 ${values.username}`);
      setCreateModalOpen(false);
      createForm.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (record: UserRecord) => {
    setCurrentRecord(record);
    editForm.setFieldsValue({
      username: record.account,
      name: record.name,
      email: record.email ?? '',
      phone: record.phone ?? '',
      roleIds: record.roleIds,
      status: record.status,
    });
    setEditModalOpen(true);
  };

  const handleEditUser = async () => {
    if (!currentRecord) {
      return;
    }

    try {
      const values = await editForm.validateFields();
      setEditing(true);
      await updateUser(currentRecord.id, {
        username: values.username.trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        roleIds: values.roleIds ?? [],
        status: values.status === '启用' ? 1 : 0,
      });

      message.success(`已更新用户 ${values.username}`);
      setEditModalOpen(false);
      setCurrentRecord(null);
      editForm.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setEditing(false);
    }
  };

  const openResetPasswordModal = (record: UserRecord) => {
    setCurrentRecord(record);
    resetPasswordForm.resetFields();
    setResetPasswordModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!currentRecord) {
      return;
    }

    try {
      const values = await resetPasswordForm.validateFields();
      setResettingPassword(true);
      await updateUser(currentRecord.id, {
        username: currentRecord.account,
        name: currentRecord.name,
        email: currentRecord.email ?? '',
        phone: currentRecord.phone ?? undefined,
        status: currentRecord.status === '启用' ? 1 : 0,
        roleIds: currentRecord.roleIds,
        password: values.password,
      });

      message.success(`已重置用户 ${currentRecord.account} 的密码`);
      setResetPasswordModalOpen(false);
      setCurrentRecord(null);
      resetPasswordForm.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="page-root">
      <UsersTable
        actionRef={actionRef}
        activeTab={activeTab}
        summary={summary}
        selectedRows={selectedRows}
        roleNameToIdMap={roleNameToIdMap}
        superAdminRoleIds={superAdminRoleIds}
        setActiveTab={setActiveTab}
        setSelectedRows={setSelectedRows}
        setSummary={setSummary}
        onCreate={() => setCreateModalOpen(true)}
        onEdit={openEditModal}
        onResetPassword={openResetPasswordModal}
        onStatusChange={handleStatusChange}
        onDelete={(record) => {
          void handleDeleteUser(record);
        }}
      />

      <UserModals
        createForm={createForm}
        editForm={editForm}
        resetPasswordForm={resetPasswordForm}
        currentRecord={currentRecord}
        roleOptions={roleOptions}
        createModalOpen={createModalOpen}
        editModalOpen={editModalOpen}
        resetPasswordModalOpen={resetPasswordModalOpen}
        creating={creating}
        editing={editing}
        resettingPassword={resettingPassword}
        onCreateOk={() => void handleCreateUser()}
        onEditOk={() => void handleEditUser()}
        onResetPasswordOk={() => void handleResetPassword()}
        onCreateCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onEditCancel={() => {
          setEditModalOpen(false);
          setCurrentRecord(null);
          editForm.resetFields();
        }}
        onResetPasswordCancel={() => {
          setResetPasswordModalOpen(false);
          setCurrentRecord(null);
          resetPasswordForm.resetFields();
        }}
      />
    </div>
  );
}
