import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Tabs, Tag, Typography } from 'antd';
import type { RefObject } from 'react';
import { fetchPermissions } from '../../../../api/permissions';
import type { PermissionRecord, PermissionTabKey } from '../../types';
import { toPermissionRecord } from '../../utils';
import './index.less';

type PermissionsTableProps = {
  actionRef: RefObject<ActionType | null>;
  activeTab: PermissionTabKey;
  selectedRows: PermissionRecord[];
  setActiveTab: (key: PermissionTabKey) => void;
  setSelectedRows: (rows: PermissionRecord[]) => void;
  onCreate: () => void;
  onView: (record: PermissionRecord) => void;
  onEdit: (record: PermissionRecord) => void;
};

export function PermissionsTable({
  actionRef,
  activeTab,
  selectedRows,
  setActiveTab,
  setSelectedRows,
  onCreate,
  onView,
  onEdit,
}: PermissionsTableProps) {
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
        <a key="view" onClick={() => onView(record)}>查看详情</a>,
        <a key="edit" onClick={() => onEdit(record)}>编辑</a>,
      ],
    },
  ];

  return (
    <div className="section-stack">
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
          subTitle: '支持权限列表查询、新增编辑和详情查看。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={onCreate}>
            新建权限
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
