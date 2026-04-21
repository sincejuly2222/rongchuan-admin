import { CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Card, Col, Form, Input, InputNumber, Modal, Progress, Row, Select, Space, Statistic, Switch, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createActivity, fetchActivities, updateActivity, updateActivityStatus } from '../../api/activities';
import { fetchOrganizations } from '../../api/organizations';
import type { ActivityItem, OrganizationItem } from '../../api/types';
import '../BusinessPageCommon.less';

type ActivityFormValues = {
  name: string;
  type: string;
  organizationId?: number;
  city?: string;
  venue?: string;
  startTime: string;
  endTime?: string;
  capacity?: number;
  enrollments?: number;
  status: number;
  description?: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

function getStatusMeta(status: number) {
  if (status === 1) return { text: '进行中', color: 'success' as const };
  if (status === 2) return { text: '已结束', color: 'default' as const };
  return { text: '报名中', color: 'processing' as const };
}

export function ActivitiesPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<ActivityFormValues>();
  const [summary, setSummary] = useState({ total: 0, open: 0, enrollments: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ActivityItem | null>(null);
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationItem[]>([]);

  useEffect(() => {
    void fetchOrganizations({ current: 1, pageSize: 100 }).then((data) => setOrganizationOptions(data.list)).catch(() => setOrganizationOptions([]));
  }, []);

  const columns: ProColumns<ActivityItem>[] = [
    { title: '活动名称', dataIndex: 'name', ellipsis: true },
    { title: '活动类型', dataIndex: 'type', width: 110, valueType: 'select', valueEnum: { 论坛: { text: '论坛' }, 沙龙: { text: '沙龙' }, 返校日: { text: '返校日' }, 招聘会: { text: '招聘会' } } },
    { title: '主办组织', dataIndex: 'organization_name', width: 140, render: (_, record) => record.organization_name || '-' },
    { title: '城市', dataIndex: 'city', width: 100, render: (_, record) => record.city || '-' },
    { title: '地点', dataIndex: 'venue', ellipsis: true, search: false, render: (_, record) => record.venue || '-' },
    { title: '开始时间', dataIndex: 'start_time', width: 180, search: false, render: (_, record) => formatDateTime(record.start_time) },
    {
      title: '报名进度',
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ minWidth: 180 }}>
          <span>{record.enrollments} / {record.capacity}</span>
          <Progress percent={record.capacity > 0 ? Math.min(100, Math.round((record.enrollments / record.capacity) * 100)) : 0} size="small" />
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      valueEnum: { 0: { text: '报名中' }, 1: { text: '进行中' }, 2: { text: '已结束' } },
      render: (_, record) => {
        const meta = getStatusMeta(record.status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <a key="edit" onClick={() => {
          setCurrentRecord(record);
          form.setFieldsValue({
            name: record.name,
            type: record.type,
            organizationId: record.organization_id ?? undefined,
            city: record.city ?? '',
            venue: record.venue ?? '',
            startTime: record.start_time?.slice(0, 16).replace('T', ' '),
            endTime: record.end_time?.slice(0, 16).replace('T', ' ') ?? '',
            capacity: record.capacity,
            enrollments: record.enrollments,
            status: record.status,
            description: record.description ?? '',
          });
          setModalOpen(true);
        }}>编辑</a>,
        <Switch
          key="status"
          size="small"
          checked={record.status !== 2}
          checkedChildren="开"
          unCheckedChildren="关"
          onChange={(checked) => {
            void updateActivityStatus(record.id, checked ? (record.status === 2 ? 0 : record.status) : 2)
              .then(() => {
                message.success('活动状态已更新');
                void actionRef.current?.reload();
              })
              .catch((error: unknown) => message.error(error instanceof Error ? error.message : '更新活动状态失败'));
          }}
        />,
      ],
    },
  ];

  return (
    <div className="business-page">
      <Row gutter={[16, 16]} className="business-page__summary">
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="活动总数" value={summary.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="报名中的活动" value={summary.open} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="累计报名人次" value={summary.enrollments} prefix={<EnvironmentOutlined />} /></Card></Col>
      </Row>

      <ProTable<ActivityItem>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        headerTitle="活动管理"
        columns={columns}
        request={async (params) => {
          const data = await fetchActivities({
            current: params.current,
            pageSize: params.pageSize,
            keyword: typeof params.name === 'string' ? params.name : undefined,
            type: params.type as string | undefined,
            status: params.status as number | string | undefined,
            city: typeof params.city === 'string' ? params.city : undefined,
          });

          setSummary({
            total: data.total,
            open: data.list.filter((item) => item.status === 0).length,
            enrollments: data.list.reduce((sum, item) => sum + item.enrollments, 0),
          });

          return { data: data.list, total: data.total, success: true };
        }}
        search={{ labelWidth: 92, defaultCollapsed: false }}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        toolbar={{ subTitle: '已接入真实活动接口，支持创建、编辑和状态管理。' }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => { setCurrentRecord(null); form.resetFields(); form.setFieldsValue({ status: 0, capacity: 0, enrollments: 0 }); setModalOpen(true); }}>
            新建活动
          </Button>,
        ]}
      />

      <Modal title={currentRecord ? '编辑活动' : '新建活动'} open={modalOpen} confirmLoading={submitting} destroyOnHidden okText="确定" cancelText="取消" onOk={() => {
        void form.validateFields().then(async (values) => {
          setSubmitting(true);
          const payload = {
            name: values.name.trim(),
            type: values.type,
            organizationId: values.organizationId,
            city: values.city?.trim() || undefined,
            venue: values.venue?.trim() || undefined,
            startTime: values.startTime.trim(),
            endTime: values.endTime?.trim() || undefined,
            capacity: values.capacity ?? 0,
            enrollments: values.enrollments ?? 0,
            status: values.status,
            description: values.description?.trim() || undefined,
          };

          try {
            if (currentRecord) {
              await updateActivity(currentRecord.id, payload);
              message.success('活动已更新');
            } else {
              await createActivity(payload);
              message.success('活动已创建');
            }
            setModalOpen(false);
            setCurrentRecord(null);
            form.resetFields();
            void actionRef.current?.reload();
          } catch (error) {
            message.error(error instanceof Error ? error.message : '保存活动失败');
          } finally {
            setSubmitting(false);
          }
        }).catch(() => undefined);
      }} onCancel={() => { setModalOpen(false); setCurrentRecord(null); form.resetFields(); }}>
        <Form form={form} layout="vertical" initialValues={{ status: 0, capacity: 0, enrollments: 0 }}>
          <Form.Item label="活动名称" name="name" rules={[{ required: true, message: '请输入活动名称' }]}><Input /></Form.Item>
          <Form.Item label="活动类型" name="type" rules={[{ required: true, message: '请选择活动类型' }]}><Select options={[{ label: '论坛', value: '论坛' }, { label: '沙龙', value: '沙龙' }, { label: '返校日', value: '返校日' }, { label: '招聘会', value: '招聘会' }]} /></Form.Item>
          <Form.Item label="主办组织" name="organizationId"><Select allowClear options={organizationOptions.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="地点" name="venue"><Input /></Form.Item>
          <Form.Item label="开始时间" name="startTime" rules={[{ required: true, message: '请输入开始时间' }]}><Input placeholder="2026-05-01 14:00:00" /></Form.Item>
          <Form.Item label="结束时间" name="endTime"><Input placeholder="2026-05-01 18:00:00" /></Form.Item>
          <Form.Item label="容量" name="capacity"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="报名人数" name="enrollments"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select options={[{ label: '报名中', value: 0 }, { label: '进行中', value: 1 }, { label: '已结束', value: 2 }]} /></Form.Item>
          <Form.Item label="活动说明" name="description"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
