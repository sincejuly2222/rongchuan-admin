import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Switch, Tabs, Tag } from 'antd';
import type { RefObject } from 'react';
import { fetchMenus } from '../../../../api/menus';
import type { MenuRecord, StatusTabKey } from '../../types';
import { toMenuRecord, toStatusCountMap } from '../../utils';
import './index.less';

type MenusTableProps = {
  actionRef: RefObject<ActionType | null>;
  activeTab: StatusTabKey;
  summary: Record<StatusTabKey, number>;
  selectedRows: MenuRecord[];
  setActiveTab: (key: StatusTabKey) => void;
  setSelectedRows: (rows: MenuRecord[]) => void;
  setSummary: (summary: Record<StatusTabKey, number>) => void;
  onCreate: () => void;
  onEdit: (record: MenuRecord) => void;
  onDelete: (record: MenuRecord) => Promise<void>;
  onStatusChange: (record: MenuRecord, checked: boolean) => Promise<void>;
};

export function MenusTable({
  actionRef,
  activeTab,
  summary,
  selectedRows,
  setActiveTab,
  setSelectedRows,
  setSummary,
  onCreate,
  onEdit,
  onDelete,
  onStatusChange,
}: MenusTableProps) {
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
      width: 240,
      render: (_, record) => [
        <a key="edit" onClick={() => onEdit(record)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该菜单吗？"
          description="如果存在子菜单，后端会阻止删除。"
          okText="删除"
          cancelText="取消"
          onConfirm={() => onDelete(record)}
        >
          <a>删除</a>
        </Popconfirm>,
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
          subTitle: '支持菜单新增、编辑、删除、状态切换和层级配置。',
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={onCreate}>
            新建菜单
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
