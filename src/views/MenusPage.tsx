import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Tabs, Tag } from 'antd';
import { useRef, useState } from 'react';
import { createMenu, fetchMenus, type MenuListItem, updateMenu, updateMenuStatus } from '../api/menus';

type MenuRecord = {
  key: number;
  id: number;
  parentId: number;
  parentName: string;
  name: string;
  code: string;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  status: '启用' | '禁用';
  createdAt: string;
  updatedAt: string;
};

type StatusTabKey = 'all' | '启用' | '禁用';

type MenuFormValues = {
  parentId?: number;
  menuName: string;
  menuCode: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder?: number;
  status: '启用' | '禁用';
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', { hour12: false });
}

function toMenuRecord(item: MenuListItem): MenuRecord {
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

function toStatusCountMap(rows: MenuRecord[]) {
  return rows.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.status] += 1;
      return acc;
    },
    { all: 0, 启用: 0, 禁用: 0 } as Record<StatusTabKey, number>,
  );
}

export function MenusPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<MenuFormValues>();
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<MenuRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MenuRecord | null>(null);
  const [summary, setSummary] = useState<Record<StatusTabKey, number>>({
    all: 0,
    启用: 0,
    禁用: 0,
  });

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      parentId: 0,
      sortOrder: 0,
      status: '启用',
    });
    setModalOpen(true);
  };

  const openEditModal = (record: MenuRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      parentId: record.parentId,
      menuName: record.name,
      menuCode: record.code,
      path: record.path === '-' ? '' : record.path,
      component: record.component === '-' ? '' : record.component,
      icon: record.icon === '-' ? '' : record.icon,
      sortOrder: record.sortOrder,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        parentId: values.parentId ?? 0,
        menuName: values.menuName.trim(),
        menuCode: values.menuCode.trim(),
        path: values.path?.trim() || null,
        component: values.component?.trim() || null,
        icon: values.icon?.trim() || null,
        sortOrder: values.sortOrder ?? 0,
        status: values.status === '启用' ? 1 : 0,
      };

      if (editingRecord) {
        await updateMenu(editingRecord.id, payload);
        message.success(`已更新菜单 ${values.menuName}`);
      } else {
        await createMenu(payload);
        message.success(`已新增菜单 ${values.menuName}`);
      }

      setModalOpen(false);
      setEditingRecord(null);
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

  const handleStatusChange = async (record: MenuRecord, checked: boolean) => {
    try {
      await updateMenuStatus(record.id, checked ? 1 : 0);
      message.success(`已${checked ? '启用' : '禁用'}菜单 ${record.name}`);
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新菜单状态失败');
    }
  };

  const columns: ProColumns<MenuRecord>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      fieldProps: { placeholder: '请输入菜单名称' },
    },
    {
      title: '菜单编码',
      dataIndex: 'code',
      width: 180,
      fieldProps: { placeholder: '请输入菜单编码' },
    },
    {
      title: '父级菜单',
      dataIndex: 'parentName',
      width: 140,
      search: false,
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      width: 180,
      search: false,
      ellipsis: true,
    },
    {
      title: '组件',
      dataIndex: 'component',
      width: 220,
      search: false,
      ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 160,
      search: false,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 100,
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
      render: (_, record) => <Tag color={record.status === '启用' ? 'success' : 'default'}>{record.status}</Tag>,
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
        <a key="edit" onClick={() => openEditModal(record)}>编辑</a>,
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

      <ProTable<MenuRecord>
        actionRef={actionRef}
        rowKey="key"
        headerTitle="菜单管理"
        columns={columns}
        request={async (params) => {
          const effectiveStatus =
            typeof params.status === 'string' && params.status
              ? params.status
              : activeTab === 'all'
                ? undefined
                : activeTab;

          const data = await fetchMenus({
            current: params.current,
            pageSize: params.pageSize,
            menuName: typeof params.name === 'string' ? params.name : undefined,
            status: effectiveStatus,
          });

          const rows = data.list.map(toMenuRecord);
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
        scroll={{ x: 1600 }}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        search={{
          labelWidth: 88,
          defaultCollapsed: false,
          span: 8,
        }}
        columnsState={{
          persistenceKey: 'menus-table',
          persistenceType: 'localStorage',
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolbar={{
          subTitle: '菜单列表支持新增、编辑、状态切换与基础层级配置。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={openCreateModal}>
            新建菜单
          </Button>,
          <Button key="export">导出配置</Button>,
          <Button key="batch" disabled={selectedRows.length === 0}>
            批量操作
          </Button>,
        ]}
      />

      <Modal
        title={editingRecord ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        forceRender
        confirmLoading={submitting}
        destroyOnHidden
        onOk={() => void handleSubmit()}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
      >
        <Form<MenuFormValues> form={form} layout="vertical">
          <Form.Item label="父级菜单" name="parentId">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0 表示顶级菜单" />
          </Form.Item>

          <Form.Item label="菜单名称" name="menuName" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item label="菜单编码" name="menuCode" rules={[{ required: true, message: '请输入菜单编码' }]}>
            <Input placeholder="请输入菜单编码，例如：menus" />
          </Form.Item>

          <Form.Item label="路由路径" name="path">
            <Input placeholder="请输入路由路径，例如：/menus" />
          </Form.Item>

          <Form.Item label="组件路径" name="component">
            <Input placeholder="请输入组件路径，例如：views/MenusPage" />
          </Form.Item>

          <Form.Item label="图标" name="icon">
            <Input placeholder="请输入图标名称，例如：MenuOutlined" />
          </Form.Item>

          <Form.Item label="排序" name="sortOrder">
            <InputNumber style={{ width: '100%' }} placeholder="请输入排序值" />
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
    </Space>
  );
}
