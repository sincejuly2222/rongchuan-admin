import type { ProColumns } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Progress, Space, Tag, Typography } from 'antd';

type RoleRecord = {
  key: string;
  roleName: string;
  roleCode: string;
  memberCount: number;
  permissionCount: number;
  scope: '全局' | '业务线' | '只读';
  updatedAt: string;
};

const roles: RoleRecord[] = [
  {
    key: '1',
    roleName: '超级管理员',
    roleCode: 'super_admin',
    memberCount: 2,
    permissionCount: 128,
    scope: '全局',
    updatedAt: '2026-03-31 09:00',
  },
  {
    key: '2',
    roleName: '运营管理员',
    roleCode: 'ops_admin',
    memberCount: 14,
    permissionCount: 72,
    scope: '业务线',
    updatedAt: '2026-03-30 17:40',
  },
  {
    key: '3',
    roleName: '审核专员',
    roleCode: 'content_reviewer',
    memberCount: 9,
    permissionCount: 38,
    scope: '业务线',
    updatedAt: '2026-03-30 16:12',
  },
  {
    key: '4',
    roleName: '只读访客',
    roleCode: 'read_only',
    memberCount: 6,
    permissionCount: 12,
    scope: '只读',
    updatedAt: '2026-03-28 11:06',
  },
];

const columns: ProColumns<RoleRecord>[] = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
  },
  {
    title: '角色编码',
    dataIndex: 'roleCode',
    copyable: true,
    width: 180,
  },
  {
    title: '成员数',
    dataIndex: 'memberCount',
    width: 100,
  },
  {
    title: '权限数',
    dataIndex: 'permissionCount',
    width: 100,
  },
  {
    title: '数据范围',
    dataIndex: 'scope',
    width: 120,
    render: (_, record) => {
      const colorMap: Record<RoleRecord['scope'], string> = {
        全局: 'red',
        业务线: 'blue',
        只读: 'default',
      };
      return <Tag color={colorMap[record.scope]}>{record.scope}</Tag>;
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
  },
  {
    title: '操作',
    valueType: 'option',
    render: () => [<a key="edit">编辑权限</a>, <a key="members">查看成员</a>],
  },
];

export function RolesPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <ProCard split="vertical" bordered>
        <ProCard colSpan="40%">
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            角色权限概览
          </Typography.Title>
          <Typography.Text type="secondary">
            统一维护后台角色、成员归属与权限范围，是标准 RBAC 管理入口。
          </Typography.Text>
        </ProCard>
        <ProCard colSpan="60%">
          <Space direction="vertical" size={18} style={{ display: 'flex' }}>
            <div>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Typography.Text>角色覆盖率</Typography.Text>
                <Typography.Text strong>92%</Typography.Text>
              </Space>
              <Progress percent={92} showInfo={false} strokeColor="#1677ff" />
            </div>
            <div>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Typography.Text>高风险权限收敛</Typography.Text>
                <Typography.Text strong>84%</Typography.Text>
              </Space>
              <Progress percent={84} showInfo={false} strokeColor="#fa8c16" />
            </div>
          </Space>
        </ProCard>
      </ProCard>

      <ProTable<RoleRecord>
        rowKey="key"
        headerTitle="角色列表"
        columns={columns}
        dataSource={roles}
        cardBordered
        dateFormatter="string"
        search={{ labelWidth: 88, defaultCollapsed: false }}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [<a key="sync">同步权限</a>, <a key="create">新建角色</a>]}
      />
    </Space>
  );
}
