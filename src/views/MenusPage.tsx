import type { ProColumns } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';

type MenuRecord = {
  key: string;
  name: string;
  path: string;
  type: '目录' | '菜单' | '按钮';
  permission: string;
  sort: number;
  status: '启用' | '隐藏';
};

const menus: MenuRecord[] = [
  {
    key: '1',
    name: '工作台',
    path: '/dashboard',
    type: '菜单',
    permission: 'dashboard:view',
    sort: 1,
    status: '启用',
  },
  {
    key: '2',
    name: '用户管理',
    path: '/users',
    type: '菜单',
    permission: 'users:view',
    sort: 2,
    status: '启用',
  },
  {
    key: '3',
    name: '角色管理',
    path: '/roles',
    type: '菜单',
    permission: 'roles:view',
    sort: 3,
    status: '启用',
  },
  {
    key: '4',
    name: '内容管理',
    path: '/content',
    type: '菜单',
    permission: 'content:view',
    sort: 4,
    status: '启用',
  },
];

const columns: ProColumns<MenuRecord>[] = [
  { title: '菜单名称', dataIndex: 'name' },
  { title: '路由地址', dataIndex: 'path', copyable: true, width: 160 },
  {
    title: '类型',
    dataIndex: 'type',
    width: 120,
    render: (_, record) => <Tag color="blue">{record.type}</Tag>,
  },
  { title: '权限标识', dataIndex: 'permission', width: 180 },
  { title: '排序', dataIndex: 'sort', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (_, record) => (
      <Tag color={record.status === '启用' ? 'success' : 'default'}>{record.status}</Tag>
    ),
  },
  {
    title: '操作',
    valueType: 'option',
    render: () => [<a key="edit">编辑</a>, <a key="children">新增下级</a>],
  },
];

export function MenusPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <ProCard title="菜单管理" bordered>
        <Typography.Text type="secondary">
          维护后台菜单层级、路由地址与权限标识，通常与角色权限模块联动。
        </Typography.Text>
      </ProCard>

      <ProTable<MenuRecord>
        rowKey="key"
        headerTitle="菜单配置"
        columns={columns}
        dataSource={menus}
        cardBordered
        dateFormatter="string"
        search={{ labelWidth: 88 }}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [<a key="sort">批量排序</a>, <a key="create">新增菜单</a>]}
      />
    </Space>
  );
}
