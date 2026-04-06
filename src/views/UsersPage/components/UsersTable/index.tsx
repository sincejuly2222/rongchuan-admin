import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Switch, Tabs, Tag, Typography } from 'antd';
import type { RefObject } from 'react';
import { fetchUsers } from '../../../../api/users';
import type { StatusTabKey, UserRecord } from '../../types';
import { toStatusCountMap, toUserRecord } from '../../utils';
import './index.less';

type UsersTableProps = {
  actionRef: RefObject<ActionType | null>;
  activeTab: StatusTabKey;
  summary: Record<StatusTabKey, number>;
  selectedRows: UserRecord[];
  roleNameToIdMap: Map<string, number>;
  setActiveTab: (key: StatusTabKey) => void;
  setSelectedRows: (rows: UserRecord[]) => void;
  setSummary: (summary: Record<StatusTabKey, number>) => void;
  onCreate: () => void;
  onEdit: (record: UserRecord) => void;
  onResetPassword: (record: UserRecord) => void;
  onStatusChange: (record: UserRecord, checked: boolean) => Promise<void>;
};

export function UsersTable({
  actionRef,
  activeTab,
  summary,
  selectedRows,
  roleNameToIdMap,
  setActiveTab,
  setSelectedRows,
  setSummary,
  onCreate,
  onEdit,
  onResetPassword,
  onStatusChange,
}: UsersTableProps) {
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
        <a key="edit" onClick={() => onEdit(record)}>编辑</a>,
        <a key="reset" onClick={() => onResetPassword(record)}>重置密码</a>,
        <Switch
          key="switch"
          size="small"
          checked={record.status === '启用'}
          onChange={(checked) => {
            void onStatusChange(record, checked);
          }}
        />,
      ],
    },
  ];

  return (
    <div className="section-stack">
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

          const rows = data.list.map((item) => toUserRecord(item, roleNameToIdMap));
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
          subTitle: '支持按条件筛选、状态切换、批量勾选和快捷操作。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={onCreate}>
            新建用户
          </Button>,
          <Button key="export">导出配置</Button>,
          <Button key="batch" disabled={selectedRows.length === 0}>
            批量操作
          </Button>,
        ]}
      />
    </div>
  );
}
