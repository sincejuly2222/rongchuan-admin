import type { ProColumns } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Col, Row, Space, Tag, Typography } from 'antd';

type ContentRecord = {
  key: string;
  title: string;
  category: string;
  author: string;
  status: '草稿' | '审核中' | '已发布' | '已下线';
  updatedAt: string;
};

const contentData: ContentRecord[] = [
  {
    key: '1',
    title: '春季活动专题页',
    category: '活动运营',
    author: '林若溪',
    status: '已发布',
    updatedAt: '2026-03-31 09:20',
  },
  {
    key: '2',
    title: '新手指引视频脚本',
    category: '帮助中心',
    author: '许清舟',
    status: '审核中',
    updatedAt: '2026-03-31 08:55',
  },
  {
    key: '3',
    title: '商家入驻说明',
    category: '公告通知',
    author: '陈晓南',
    status: '草稿',
    updatedAt: '2026-03-30 17:43',
  },
  {
    key: '4',
    title: '社区内容风险复盘',
    category: '内部文档',
    author: '顾成安',
    status: '已下线',
    updatedAt: '2026-03-29 11:10',
  },
];

const columns: ProColumns<ContentRecord>[] = [
  { title: '内容标题', dataIndex: 'title', ellipsis: true },
  { title: '分类', dataIndex: 'category', width: 140 },
  { title: '作者', dataIndex: 'author', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (_, record) => {
      const colorMap: Record<ContentRecord['status'], string> = {
        草稿: 'default',
        审核中: 'processing',
        已发布: 'success',
        已下线: 'error',
      };
      return <Tag color={colorMap[record.status]}>{record.status}</Tag>;
    },
  },
  { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  {
    title: '操作',
    valueType: 'option',
    render: () => [<a key="preview">预览</a>, <a key="edit">编辑</a>],
  },
];

export function ContentPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <ProCard bordered>
            <Typography.Text type="secondary">内容总数</Typography.Text>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              5,649
            </Typography.Title>
          </ProCard>
        </Col>
        <Col xs={24} md={8}>
          <ProCard bordered>
            <Typography.Text type="secondary">待审核内容</Typography.Text>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              132
            </Typography.Title>
          </ProCard>
        </Col>
        <Col xs={24} md={8}>
          <ProCard bordered>
            <Typography.Text type="secondary">今日发布</Typography.Text>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              46
            </Typography.Title>
          </ProCard>
        </Col>
      </Row>

      <ProTable<ContentRecord>
        rowKey="key"
        headerTitle="内容列表"
        columns={columns}
        dataSource={contentData}
        cardBordered
        dateFormatter="string"
        search={{ labelWidth: 88, defaultCollapsed: false }}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [<a key="review">批量审核</a>, <a key="create">新建内容</a>]}
      />
    </Space>
  );
}
