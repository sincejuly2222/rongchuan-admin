import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Input, Modal, Select, Space, Switch, Tabs, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRoles } from '../api/roles';
import { createUser, fetchUsers, type UserListItem, updateUser, updateUserStatus } from '../api/users';

type UserRecord = {
  key: number;
  id: number;
  name: string;
  account: string;
  email: string | null;
  phone: string | null;
  role: string;
  roleIds: number[];
  status: '启用' | '禁用';
  lastLogin: string;
  createdAt: string;
};

type StatusTabKey = 'all' | '启用' | '禁用';

type CreateUserFormValues = {
  username: string;
  name: string;
  password: string;
  email: string;
  phone?: string;
  roleIds?: number[];
  status: '启用' | '禁用';
};

type EditUserFormValues = Omit<CreateUserFormValues, 'password'>;

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

function formatDateTime(value: string | null) {
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

function toStatusCountMap(rows: UserRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

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
  const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    let active = true;

    void fetchRoles({ current: 1, pageSize: 100 }).then((data) => {
      if (!active) {
        return;
      }

      setRoleOptions(
        data.list.map((item) => ({
          label: item.role_name,
          value: item.id,
        })),
      );
    }).catch(() => {
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

  const toUserRecord = (item: UserListItem): UserRecord => {
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
  };

  const handleStatusChange = async (record: UserRecord, checked: boolean) => {
    try {
      await updateUserStatus(record.id, checked ? 1 : 0);
      message.success(`已${checked ? '启用' : '禁用'}用户 ${record.account}`);
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新用户状态失败');
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

  const columns: ProColumns<UserRecord>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
      fieldProps: {
        placeholder: '请输入姓名',
      },
    },
    {
      title: '账号',
      dataIndex: 'account',
      copyable: true,
      width: 160,
      fieldProps: {
        placeholder: '请输入账号',
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 240,
      search: false,
      ellipsis: true,
      render: (_, record) => record.email || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 160,
      search: false,
      render: (_, record) => record.phone || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 180,
      search: false,
      ellipsis: true,
      render: (_, record) =>
        record.role === '未分配' ? <Typography.Text type="secondary">未分配</Typography.Text> : record.role,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: {
        启用: { text: '启用' },
        禁用: { text: '禁用' },
      },
      render: (_, record) => (
        <Tag color={record.status === '启用' ? 'success' : 'default'}>{record.status}</Tag>
      ),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLogin',
      width: 180,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 210,
      render: (_, record) => [
        <a key="edit" onClick={() => openEditModal(record)}>编辑</a>,
        <a key="reset" onClick={() => openResetPasswordModal(record)}>重置密码</a>,
        <Switch
          key="switch"
          size="small"
          checked={record.status === '启用'}
          onChange={(checked) => {
            void handleStatusChange(record, checked);
          }}
        />,
      ],
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as StatusTabKey);
          setSelectedRows([]);
          void actionRef.current?.reload();
        }}
        items={[
          { key: 'all', label: `全部 (${summary.all})` },
          { key: '启用', label: `启用 (${summary.启用})` },
          { key: '禁用', label: `禁用 (${summary.禁用})` },
        ]}
      />

      <ProTable<UserRecord>
        actionRef={actionRef}
        rowKey="key"
        headerTitle="用户管理"
        columns={columns}
        request={async (params) => {
          const effectiveStatus =
            typeof params.status === 'string' && params.status
              ? params.status
              : activeTab === 'all'
                ? undefined
                : activeTab;

          const data = await fetchUsers({
            current: params.current,
            pageSize: params.pageSize,
            username: typeof params.account === 'string' ? params.account : undefined,
            name: typeof params.name === 'string' ? params.name : undefined,
            status: effectiveStatus,
          });

          const rows = data.list.map(toUserRecord);
          setSummary(toStatusCountMap(rows));

          return {
            data: rows,
            total: data.total,
            success: true,
          };
        }}
        cardBordered
        dateFormatter="string"
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1400 }}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        search={{
          labelWidth: 88,
          defaultCollapsed: false,
          span: 8,
        }}
        columnsState={{
          persistenceKey: 'users-table',
          persistenceType: 'localStorage',
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolbar={{
          subTitle: '用户账号列表，支持筛选、状态切换、批量选择与快捷操作。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            新建用户
          </Button>,
          <Button key="export">导出配置</Button>,
          <Button key="batch" disabled={selectedRows.length === 0}>
            批量操作
          </Button>,
        ]}
      />

      <Modal
        title="新增用户"
        open={createModalOpen}
        forceRender
        confirmLoading={creating}
        destroyOnHidden
        onOk={() => void handleCreateUser()}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
      >
        <Form<CreateUserFormValues>
          form={createForm}
          layout="vertical"
          initialValues={{ status: '启用', roleIds: [] }}
        >
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" />
          </Form.Item>

          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入用户姓名" />
          </Form.Item>

          <Form.Item
            label="初始密码"
            name="password"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入初始密码" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="角色" name="roleIds">
            <Select mode="multiple" placeholder="请选择角色" options={roleOptions} optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: '启用', value: '启用' },
                { label: '禁用', value: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑用户"
        open={editModalOpen}
        forceRender
        confirmLoading={editing}
        destroyOnHidden
        onOk={() => void handleEditUser()}
        onCancel={() => {
          setEditModalOpen(false);
          setCurrentRecord(null);
          editForm.resetFields();
        }}
      >
        <Form<EditUserFormValues> form={editForm} layout="vertical">
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" />
          </Form.Item>

          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入用户姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="角色" name="roleIds">
            <Select mode="multiple" placeholder="请选择角色" options={roleOptions} optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: '启用', value: '启用' },
                { label: '禁用', value: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetPasswordModalOpen}
        forceRender
        confirmLoading={resettingPassword}
        destroyOnHidden
        onOk={() => void handleResetPassword()}
        onCancel={() => {
          setResetPasswordModalOpen(false);
          setCurrentRecord(null);
          resetPasswordForm.resetFields();
        }}
      >
        <Form<ResetPasswordFormValues> form={resetPasswordForm} layout="vertical">
          <Form.Item label="账号">
            <Input value={currentRecord?.account} disabled />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
