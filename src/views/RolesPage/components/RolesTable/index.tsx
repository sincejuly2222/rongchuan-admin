import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Tabs, Tag, Typography } from 'antd';
import type { RefObject } from 'react';
import { fetchRoles } from '../../../../api/roles';
import type { RoleRecord, StatusTabKey } from '../../types';
import { toRoleRecord, toStatusCountMap } from '../../utils';
import './index.less';

type RolesTableProps = {
  actionRef: RefObject<ActionType | null>;
  activeTab: StatusTabKey;
  summary: Record<StatusTabKey, number>;
  selectedRows: RoleRecord[];
  setActiveTab: (key: StatusTabKey) => void;
  setSelectedRows: (rows: RoleRecord[]) => void;
  setSummary: (summary: Record<StatusTabKey, number>) => void;
  onCreate: () => void;
  onEdit: (record: RoleRecord) => void;
  onMenuConfig: (record: RoleRecord) => void;
};

export function RolesTable({
  actionRef,
  activeTab,
  summary,
  selectedRows,
  setActiveTab,
  setSelectedRows,
  setSummary,
  onCreate,
  onEdit,
  onMenuConfig,
}: RolesTableProps) {
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
      title: '菜单数',
      dataIndex: 'menuCount',
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
      width: 240,
      render: (_, record) => {
        const isSuperAdminRole = record.code === 'SUPER_ADMIN';

        return [
          <a key="edit" onClick={() => onEdit(record)}>编辑</a>,
          isSuperAdminRole ? (
            <Typography.Text
              key="menu-disabled"
              disabled
              title="超级管理员角色不可修改菜单权限"
            >
              菜单配置
            </Typography.Text>
          ) : (
            <a key="menu" onClick={() => onMenuConfig(record)}>菜单配置</a>
          ),
        ];
      },
    },
  ];

  return (
    <div className="section-stack">
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
          subTitle: '支持角色查询、新增编辑和可访问菜单配置。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={onCreate}>
            新建角色
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
