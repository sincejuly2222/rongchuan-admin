import type { ProColumns } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Button, Progress, Space, Tag, Typography } from 'antd';

type RuleRecord = {
  key: string;
  name: string;
  desc: string;
  callNo: number;
  status: '运行中' | '已关闭' | '草稿';
  updatedAt: string;
};

const ruleData: RuleRecord[] = [
  {
    key: '1',
    name: 'TradeCode 规则引擎',
    desc: '模拟官方 table-list 风格的规则配置记录',
    callNo: 98,
    status: '运行中',
    updatedAt: '2026-03-31 09:12',
  },
  {
    key: '2',
    name: '内容审核流程',
    desc: '用于审核任务分发和状态聚合',
    callNo: 76,
    status: '运行中',
    updatedAt: '2026-03-31 08:45',
  },
  {
    key: '3',
    name: '用户风控巡检',
    desc: '夜间批处理规则，失败后触发告警',
    callNo: 42,
    status: '草稿',
    updatedAt: '2026-03-30 21:10',
  },
  {
    key: '4',
    name: '订单超时回收',
    desc: '处理超时未支付订单的回收任务',
    callNo: 65,
    status: '已关闭',
    updatedAt: '2026-03-29 15:08',
  },
];

const columns: ProColumns<RuleRecord>[] = [
  {
    title: '规则名称',
    dataIndex: 'name',
    ellipsis: true,
    fieldProps: {
      placeholder: '请输入规则名称',
    },
  },
  {
    title: '描述',
    dataIndex: 'desc',
    ellipsis: true,
    fieldProps: {
      placeholder: '请输入描述',
    },
  },
  {
    title: '服务调用次数',
    dataIndex: 'callNo',
    hideInSearch: true,
    width: 220,
    render: (_, record) => (
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Progress percent={record.callNo} size="small" showInfo={false} />
        <Typography.Text type="secondary">{record.callNo} / 100</Typography.Text>
      </Space>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    valueEnum: {
      运行中: { text: '运行中', status: 'Success' },
      已关闭: { text: '已关闭', status: 'Default' },
      草稿: { text: '草稿', status: 'Processing' },
    },
    render: (_, record) => {
      const colorMap: Record<RuleRecord['status'], string> = {
        运行中: 'success',
        已关闭: 'default',
        草稿: 'processing',
      };
      return <Tag color={colorMap[record.status]}>{record.status}</Tag>;
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    valueType: 'dateTime',
    width: 180,
    hideInSearch: true,
  },
  {
    title: '操作',
    valueType: 'option',
    width: 160,
    render: () => [<a key="config">配置</a>, <a key="subscribe">订阅警报</a>],
  },
];

export function TableListPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <ProCard
        title="查询表格"
        subTitle="独立示例页，专门参考 Ant Design Pro 的 table-list 页面。"
        bordered
      >
        <Typography.Text type="secondary">
          这页用于模仿官方 Pro 示例的搜索表单、操作栏和规则表格布局，不影响具体业务页面语义。
        </Typography.Text>
      </ProCard>

      <ProTable<RuleRecord>
        rowKey="key"
        headerTitle="查询表格"
        columns={columns}
        dataSource={ruleData}
        cardBordered
        dateFormatter="string"
        rowSelection={{}}
        pagination={{ pageSize: 10 }}
        search={{
          labelWidth: 96,
          defaultCollapsed: false,
          span: 8,
        }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        toolBarRender={() => [
          <Button key="primary" type="primary">
            新建
          </Button>,
        ]}
      />
    </Space>
  );
}
