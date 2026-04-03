import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Descriptions, Form, Input, Modal, Space, Tabs, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import {
  createPermission,
  fetchPermissions,
  type PermissionListItem,
  updatePermission,
} from '../api/permissions';

type PermissionRecord = {
  key: number;
  id: number;
  code: string;
  name: string;
  description: string;
  roleCount: number;
  createdAt: string;
  updatedAt: string;
};

type PermissionTabKey = 'all';

type PermissionFormValues = {
  permissionCode: string;
  permissionName: string;
  description?: string;
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

function toPermissionRecord(item: PermissionListItem): PermissionRecord {
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

export function PermissionsPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<PermissionFormValues>();
  const [activeTab, setActiveTab] = useState<PermissionTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<PermissionRecord[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PermissionRecord | null>(null);

  const columns: ProColumns<PermissionRecord>[] = [
    {
      title: '权限名称',
      dataIndex: 'name',
      fieldProps: {
        placeholder: '请输入权限名称',
      },
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      width: 240,
      copyable: true,
      fieldProps: {
        placeholder: '请输入权限编码',
      },
    },
    {
      title: '绑定角色数',
      dataIndex: 'roleCount',
      width: 120,
      search: false,
      render: (_, record) => <Tag color="blue">{record.roleCount}</Tag>,
    },
    {
      title: '权限说明',
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
      width: 220,
      render: (_, record) => [
        <a
          key="view"
          onClick={() => {
            setCurrentRecord(record);
            setDetailOpen(true);
          }}
        >
          查看详情
        </a>,
        <a
          key="edit"
          onClick={() => {
            setCurrentRecord(record);
            form.setFieldsValue({
              permissionCode: record.code,
              permissionName: record.name,
              description: record.description === '-' ? '' : record.description,
            });
            setModalOpen(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (currentRecord) {
        await updatePermission(currentRecord.id, {
          permissionCode: values.permissionCode.trim(),
          permissionName: values.permissionName.trim(),
          description: values.description?.trim() || null,
        });
        message.success(`已更新权限 ${values.permissionName}`);
      } else {
        await createPermission({
          permissionCode: values.permissionCode.trim(),
          permissionName: values.permissionName.trim(),
          description: values.description?.trim() || null,
        });
        message.success(`已新增权限 ${values.permissionName}`);
      }

      setModalOpen(false);
      setCurrentRecord(null);
      form.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Tabs
        activeKey={activeTab}
        items={[{ key: 'all', label: '全部权限' }]}
        onChange={(key) => {
          setActiveTab(key as PermissionTabKey);
          setSelectedRows([]);
          void actionRef.current?.reload();
        }}
      />

      <ProTable<PermissionRecord>
        actionRef={actionRef}
        rowKey="key"
        headerTitle="权限管理"
        columns={columns}
        request={async (params) => {
          const data = await fetchPermissions({
            current: params.current,
            pageSize: params.pageSize,
            permissionCode: typeof params.code === 'string' ? params.code : undefined,
            permissionName: typeof params.name === 'string' ? params.name : undefined,
          });

          return {
            data: data.list.map(toPermissionRecord),
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
          persistenceKey: 'permissions-table',
          persistenceType: 'localStorage',
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolbar={{
          subTitle: '权限列表基于当前后端真实接口展示，可按名称和编码检索。',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setCurrentRecord(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            新建权限
          </Button>,
          <Button key="export">导出配置</Button>,
          <Button key="batch" disabled={selectedRows.length === 0}>
            批量操作
          </Button>,
        ]}
      />

      <Modal
        title="权限详情"
        open={detailOpen}
        footer={null}
        onCancel={() => {
          setDetailOpen(false);
          setCurrentRecord(null);
        }}
      >
        {currentRecord ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="权限名称">{currentRecord.name}</Descriptions.Item>
            <Descriptions.Item label="权限编码">{currentRecord.code}</Descriptions.Item>
            <Descriptions.Item label="权限说明">
              {currentRecord.description === '-' ? '未填写' : currentRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="绑定角色数">{currentRecord.roleCount}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{currentRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={currentRecord ? '编辑权限' : '新增权限'}
        open={modalOpen}
        forceRender
        confirmLoading={submitting}
        destroyOnHidden
        onOk={() => void handleSubmit()}
        onCancel={() => {
          setModalOpen(false);
          setCurrentRecord(null);
          form.resetFields();
        }}
      >
        <Form<PermissionFormValues> form={form} layout="vertical">
          <Form.Item
            label="权限名称"
            name="permissionName"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            label="权限编码"
            name="permissionCode"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input placeholder="请输入权限编码，例如：user:list" />
          </Form.Item>

          <Form.Item label="权限说明" name="description">
            <Input.TextArea placeholder="请输入权限说明" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
