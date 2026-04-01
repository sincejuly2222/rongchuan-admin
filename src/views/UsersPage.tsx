import type { ProColumns } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Space, Switch, Tag, Typography } from 'antd';

type UserRecord = {
  key: string;
  name: string;
  account: string;
  department: string;
  role: string;
  status: '启用' | '禁用';
  lastLogin: string;
};

const users: UserRecord[] = [
  {
    key: '1',
    name: '陈晓南',
    account: 'chenxn',
    department: '运营中心',
    role: '超级管理员',
    status: '启用',
    lastLogin: '2026-03-31 09:12',
  },
  {
    key: '2',
    name: '林若溪',
    account: 'linrx',
    department: '内容审核',
    role: '审核专员',
    status: '启用',
    lastLogin: '2026-03-31 08:41',
  },
  {
    key: '3',
    name: '顾成安',
    account: 'guca',
    department: '客服中心',
    role: '客服主管',
    status: '禁用',
    lastLogin: '2026-03-29 18:20',
  },
  {
    key: '4',
    name: '叶明哲',
    account: 'yemz',
    department: '技术平台',
    role: '运维工程师',
    status: '启用',
    lastLogin: '2026-03-31 07:58',
  },
];

const columns: ProColumns<UserRecord>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '账号',
    dataIndex: 'account',
    copyable: true,
    width: 140,
  },
  {
    title: '部门',
    dataIndex: 'department',
    width: 140,
  },
  {
    title: '角色',
    dataIndex: 'role',
    width: 140,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (_, record) => (
      <Tag color={record.status === '启用' ? 'success' : 'default'}>{record.status}</Tag>
    ),
  },
  {
    title: '最近登录',
    dataIndex: 'lastLogin',
    width: 180,
  },
  {
    title: '操作',
    valueType: 'option',
    width: 180,
    render: (_, record) => [
      <a key="edit">编辑</a>,
      <a key="reset">重置密码</a>,
      <Switch key="switch" size="small" checked={record.status === '启用'} />,
    ],
  },
];

export function UsersPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <ProCard
        title="用户管理"
        subTitle="标准后台常见的账号管理页面，包含筛选、列表与状态操作。"
        bordered
      >
        <Typography.Text type="secondary">
          适用于系统管理员、审核员、客服、运营等后台账号的统一维护。
        </Typography.Text>
      </ProCard>

      <ProTable<UserRecord>
        rowKey="key"
        headerTitle="用户列表"
        columns={columns}
        dataSource={users}
        cardBordered
        dateFormatter="string"
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        pagination={{ pageSize: 10 }}
        search={{
          labelWidth: 88,
          defaultCollapsed: false,
        }}
        columnsState={{
          persistenceKey: 'users-table',
          persistenceType: 'localStorage',
        }}
        toolBarRender={() => [<a key="export">导出</a>, <a key="create">新建用户</a>]}
      />
    </Space>
  );
}
