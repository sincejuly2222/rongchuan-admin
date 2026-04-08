import { ApartmentOutlined, FlagOutlined, TeamOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Statistic, Switch, Tag } from 'antd';
import { useRef, useState } from 'react';
import { createOrganization, fetchOrganizations, updateOrganization, updateOrganizationStatus } from '../../api/organizations';
import type { OrganizationItem } from '../../api/types';
import '../BusinessPageCommon.less';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return value.slice(0, 10);
}

function getStatusMeta(status: number) {
  return status === 1
    ? { text: '运营中', color: 'success' as const }
    : { text: '筹备中', color: 'warning' as const };
}

type OrganizationFormValues = {
  name: string;
  type: string;
  principal?: string;
  city?: string;
  memberCount?: number;
  pendingCount?: number;
  activeCount?: number;
  foundedAt?: string;
  status: number;
  description?: string;
};

export function OrganizationsPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<OrganizationFormValues>();
  const [summary, setSummary] = useState({ total: 0, running: 0, members: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OrganizationItem | null>(null);

  const columns: ProColumns<OrganizationItem>[] = [
    { title: '组织名称', dataIndex: 'name', ellipsis: true },
    { title: '组织类型', dataIndex: 'type', width: 120, valueType: 'select', valueEnum: { 校友会: { text: '校友会' }, 地方组织: { text: '地方组织' }, 行业组织: { text: '行业组织' }, 学院分会: { text: '学院分会' } } },
    { title: '负责人', dataIndex: 'principal', width: 110, render: (_, record) => record.principal || '-' },
    { title: '城市', dataIndex: 'city', width: 100, render: (_, record) => record.city || '-' },
    { title: '成员数', dataIndex: 'member_count', width: 100, search: false },
    { title: '待审核成员', dataIndex: 'pending_count', width: 110, search: false },
    { title: '近期活跃活动', dataIndex: 'active_count', width: 120, search: false },
    { title: '成立时间', dataIndex: 'founded_at', width: 120, search: false, render: (_, record) => formatDate(record.founded_at) },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: { 1: { text: '运营中' }, 0: { text: '筹备中' } },
      render: (_, record) => {
        const meta = getStatusMeta(record.status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => {
          setCurrentRecord(record);
          form.setFieldsValue({
            name: record.name,
            type: record.type,
            principal: record.principal ?? '',
            city: record.city ?? '',
            memberCount: record.member_count,
            pendingCount: record.pending_count,
            activeCount: record.active_count,
            foundedAt: record.founded_at ?? '',
            status: record.status,
            description: record.description ?? '',
          });
          setModalOpen(true);
        }}>编辑</a>,
        <Switch
          key="status"
          size="small"
          checked={record.status === 1}
          onChange={(checked) => {
            void updateOrganizationStatus(record.id, checked ? 1 : 0)
              .then(() => {
                message.success('组织状态已更新');
                void actionRef.current?.reload();
              })
              .catch((error: unknown) => message.error(error instanceof Error ? error.message : '更新组织状态失败'));
          }}
        />,
      ],
    },
  ];

  return (
    <div className="business-page">
      <Row gutter={[16, 16]} className="business-page__summary">
        <Col xs={24} sm={12} xl={8}><Card bordered={false}><Statistic title="组织总数" value={summary.total} prefix={<ApartmentOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card bordered={false}><Statistic title="运营中的组织" value={summary.running} prefix={<FlagOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card bordered={false}><Statistic title="覆盖成员数" value={summary.members} prefix={<TeamOutlined />} /></Card></Col>
      </Row>

      <ProTable<OrganizationItem>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        headerTitle="组织管理"
        columns={columns}
        request={async (params) => {
          const data = await fetchOrganizations({
            current: params.current,
            pageSize: params.pageSize,
            keyword: typeof params.name === 'string' ? params.name : undefined,
            type: params.type as string | undefined,
            status: params.status as number | string | undefined,
            city: typeof params.city === 'string' ? params.city : undefined,
          });

          setSummary({
            total: data.total,
            running: data.list.filter((item) => item.status === 1).length,
            members: data.list.reduce((sum, item) => sum + item.member_count, 0),
          });

          return { data: data.list, total: data.total, success: true };
        }}
        search={{ labelWidth: 92, defaultCollapsed: false }}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        toolbar={{ subTitle: '已接入真实组织接口，可统一维护校友会、地方组织和行业组织。' }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => { setCurrentRecord(null); form.resetFields(); form.setFieldsValue({ status: 1, memberCount: 0, pendingCount: 0, activeCount: 0 }); setModalOpen(true); }}>
            新建组织
          </Button>,
        ]}
      />

      <Modal title={currentRecord ? '编辑组织' : '新建组织'} open={modalOpen} confirmLoading={submitting} destroyOnHidden onOk={() => {
        void form.validateFields().then(async (values) => {
          setSubmitting(true);
          const payload = {
            name: values.name.trim(),
            type: values.type,
            principal: values.principal?.trim() || undefined,
            city: values.city?.trim() || undefined,
            memberCount: values.memberCount ?? 0,
            pendingCount: values.pendingCount ?? 0,
            activeCount: values.activeCount ?? 0,
            foundedAt: values.foundedAt?.trim() || undefined,
            status: values.status,
            description: values.description?.trim() || undefined,
          };

          try {
            if (currentRecord) {
              await updateOrganization(currentRecord.id, payload);
              message.success('组织已更新');
            } else {
              await createOrganization(payload);
              message.success('组织已创建');
            }
            setModalOpen(false);
            setCurrentRecord(null);
            form.resetFields();
            void actionRef.current?.reload();
          } catch (error) {
            message.error(error instanceof Error ? error.message : '保存组织失败');
          } finally {
            setSubmitting(false);
          }
        }).catch(() => undefined);
      }} onCancel={() => { setModalOpen(false); setCurrentRecord(null); form.resetFields(); }}>
        <Form form={form} layout="vertical" initialValues={{ status: 1, memberCount: 0, pendingCount: 0, activeCount: 0 }}>
          <Form.Item label="组织名称" name="name" rules={[{ required: true, message: '请输入组织名称' }]}><Input /></Form.Item>
          <Form.Item label="组织类型" name="type" rules={[{ required: true, message: '请选择组织类型' }]}><Select options={[{ label: '校友会', value: '校友会' }, { label: '地方组织', value: '地方组织' }, { label: '行业组织', value: '行业组织' }, { label: '学院分会', value: '学院分会' }]} /></Form.Item>
          <Form.Item label="负责人" name="principal"><Input /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="成员数" name="memberCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="待审核成员" name="pendingCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="近期活跃活动" name="activeCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="成立时间" name="foundedAt"><Input placeholder="2026-04-08" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select options={[{ label: '运营中', value: 1 }, { label: '筹备中', value: 0 }]} /></Form.Item>
          <Form.Item label="组织说明" name="description"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
