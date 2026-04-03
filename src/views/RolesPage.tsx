import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Input, Modal, Select, Space, Tabs, Tag, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { fetchPermissions } from '../api/permissions';
import {
  createRole,
  fetchRolePermissions,
  fetchRoles,
  type RoleListItem,
  updateRole,
  updateRolePermissions,
} from '../api/roles';

type RoleRecord = {
  key: number;
  id: number;
  name: string;
  code: string;
  description: string;
  memberCount: number;
  permissionCount: number;
  status: '启用' | '禁用';
  createdAt: string;
  updatedAt: string;
};

type StatusTabKey = 'all' | '启用' | '禁用';

type RoleFormValues = {
  roleName: string;
  roleCode: string;
  description?: string;
  status: '启用' | '禁用';
};

type PermissionFormValues = {
  permissionIds: number[];
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

function toStatusCountMap(rows: RoleRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

function toRoleRecord(item: RoleListItem): RoleRecord {
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
  const [permissionOptions, setPermissionOptions] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    let active = true;

    void fetchPermissions({ current: 1, pageSize: 200 }).then((data) => {
      if (!active) {
        return;
      }

      setPermissionOptions(
        data.list.map((item) => ({
          label: `${item.permission_name} (${item.permission_code})`,
          value: item.id,
        })),
      );
    }).catch(() => {
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

  const columns: ProColumns<RoleRecord>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      fieldProps: {
        placeholder: '请输入角色名称',
      },
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 180,
      fieldProps: {
        placeholder: '请输入角色编码',
      },
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      width: 120,
      search: false,
    },
    {
      title: '权限数',
      dataIndex: 'permissionCount',
      width: 120,
      search: false,
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
      title: '角色说明',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      render: (_, record) =>
        record.description === '-' ? <Typography.Text type="secondary">未填写</Typography.Text> : record.description,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, record) => [
        <a key="edit" onClick={() => openEditModal(record)}>编辑</a>,
        <a key="permission" onClick={() => { void openPermissionModal(record); }}>权限配置</a>,
      ],
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Tabs
        activeKey={activeTab}
        items={[
          { key: 'all', label: `全部 (${summary.all})` },
          { key: '启用', label: `启用 (${summary.启用})` },
          { key: '禁用', label: `禁用 (${summary.禁用})` },
        ]}
        onChange={(key) => {
          setActiveTab(key as StatusTabKey);
          setSelectedRows([]);
          void actionRef.current?.reload();
        }}
      />

      <ProTable<RoleRecord>
        actionRef={actionRef}
        rowKey="key"
        headerTitle="角色管理"
        columns={columns}
        request={async (params) => {
          const effectiveStatus =
            typeof params.status === 'string' && params.status
              ? params.status
              : activeTab === 'all'
                ? undefined
                : activeTab;

          const data = await fetchRoles({
            current: params.current,
            pageSize: params.pageSize,
            roleName: typeof params.name === 'string' ? params.name : undefined,
            roleCode: typeof params.code === 'string' ? params.code : undefined,
            status: effectiveStatus,
          });

          const rows = data.list.map(toRoleRecord);
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
          persistenceKey: 'roles-table',
          persistenceType: 'localStorage',
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolbar={{
          subTitle: '当前支持角色列表查询、角色新增编辑和角色权限配置。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={openCreateModal}>
            新建角色
          </Button>,
          <Button key="export">导出配置</Button>,
          <Button key="batch" disabled={selectedRows.length === 0}>
            批量操作
          </Button>,
        ]}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalOpen}
        forceRender
        confirmLoading={roleSubmitting}
        destroyOnHidden
        onOk={() => void handleSubmitRole()}
        onCancel={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
          roleForm.resetFields();
        }}
      >
        <Form<RoleFormValues> form={roleForm} layout="vertical">
          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色编码"
            name="roleCode"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码，例如：OPERATOR" />
          </Form.Item>

          <Form.Item label="角色说明" name="description">
            <Input.TextArea placeholder="请输入角色说明" rows={4} />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
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
        title={currentRole ? `权限配置 - ${currentRole.name}` : '权限配置'}
        open={permissionModalOpen}
        confirmLoading={permissionSubmitting}
        destroyOnHidden
        onOk={() => void handleSavePermissions()}
        onCancel={() => {
          setPermissionModalOpen(false);
          setCurrentRole(null);
          permissionForm.resetFields();
        }}
      >
        <Form<PermissionFormValues> form={permissionForm} layout="vertical">
          <Form.Item label="已选权限" name="permissionIds">
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissionOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
