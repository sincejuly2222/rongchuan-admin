import { BankOutlined, IdcardOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
} from 'antd';
import { useRef, useState } from 'react';
import {
  createAlumni,
  fetchAlumni,
  fetchAlumniDetail,
  updateAlumni,
  updateAlumniStatus,
  upsertAlumniCard,
  upsertStudentRecord,
} from '../../api/alumni';
import type { AlumniDetail, AlumniListItem } from '../../api/types';
import '../BusinessPageCommon.less';

type AlumniFormValues = {
  openId?: string;
  phone?: string;
  name: string;
  company?: string;
  position?: string;
  city?: string;
  bio?: string;
  status: number;
  verifiedStatus: number;
  allowSearch: boolean;
};

type StudentFormValues = {
  school: string;
  college?: string;
  major: string;
  className?: string;
  studentNo?: string;
  enrollmentYear: number;
  graduationYear?: number | null;
  status: number;
};

type CardFormValues = {
  slogan?: string;
  wechat?: string;
  showPhone: boolean;
  showWechat: boolean;
  needApproval: boolean;
  allowSearch: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

function getStatusMeta(status: number) {
  if (status === 0) return { text: '禁用', color: 'default' as const };
  return { text: '正常', color: 'success' as const };
}

function getVerifiedMeta(status: number) {
  if (status === 1) return { text: '认证中', color: 'processing' as const };
  if (status === 2) return { text: '已认证', color: 'success' as const };
  if (status === 3) return { text: '认证失败', color: 'error' as const };
  return { text: '未认证', color: 'default' as const };
}

export function AlumniPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<AlumniFormValues>();
  const [studentForm] = Form.useForm<StudentFormValues>();
  const [cardForm] = Form.useForm<CardFormValues>();
  const [summary, setSummary] = useState({ total: 0, verified: 0, pending: 0, cities: 0 });
  const [editingRecord, setEditingRecord] = useState<AlumniDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDetailAndOpen = async (record: AlumniListItem, type: 'edit' | 'student' | 'card') => {
    try {
      const detail = await fetchAlumniDetail(record.id);
      setEditingRecord(detail);

      if (type === 'edit') {
        form.setFieldsValue({
          openId: detail.open_id ?? '',
          phone: detail.phone ?? '',
          name: detail.name,
          company: detail.company ?? '',
          position: detail.position ?? '',
          city: detail.city ?? '',
          bio: detail.bio ?? '',
          status: detail.status,
          verifiedStatus: detail.verified_status,
          allowSearch: detail.allow_search === 1,
        });
        setEditOpen(true);
        return;
      }

      if (type === 'student') {
        studentForm.setFieldsValue({
          school: detail.student_record?.school ?? '融川大学',
          college: detail.student_record?.college ?? '',
          major: detail.student_record?.major ?? '',
          className: detail.student_record?.class_name ?? '',
          studentNo: detail.student_record?.student_no ?? '',
          enrollmentYear: detail.student_record?.enrollment_year,
          graduationYear: detail.student_record?.graduation_year ?? undefined,
          status: detail.student_record?.status ?? 0,
        });
        setStudentOpen(true);
        return;
      }

      cardForm.setFieldsValue({
        slogan: detail.card?.slogan ?? '',
        wechat: detail.card?.wechat ?? '',
        showPhone: detail.card?.show_phone === 1,
        showWechat: detail.card?.show_wechat === 1,
        needApproval: detail.card?.need_approval === 1,
        allowSearch: detail.card?.allow_search !== 0,
      });
      setCardOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取校友详情失败');
    }
  };

  const handleSubmitAlumni = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        openId: values.openId?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        name: values.name.trim(),
        company: values.company?.trim() || undefined,
        position: values.position?.trim() || undefined,
        city: values.city?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        status: values.status,
        verifiedStatus: values.verifiedStatus,
        allowSearch: values.allowSearch ? 1 : 0,
      };

      if (editingRecord) {
        await updateAlumni(editingRecord.id, payload);
        message.success('校友信息已更新');
      } else {
        await createAlumni(payload);
        message.success('校友已新增');
      }

      setEditOpen(false);
      setEditingRecord(null);
      form.resetFields();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitStudent = async () => {
    if (!editingRecord) return;

    try {
      const values = await studentForm.validateFields();
      setSubmitting(true);
      await upsertStudentRecord(editingRecord.id, {
        school: values.school.trim(),
        college: values.college?.trim() || undefined,
        major: values.major.trim(),
        className: values.className?.trim() || undefined,
        studentNo: values.studentNo?.trim() || undefined,
        enrollmentYear: values.enrollmentYear,
        graduationYear: values.graduationYear ?? undefined,
        status: values.status,
      });
      message.success('学籍信息已保存');
      setStudentOpen(false);
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCard = async () => {
    if (!editingRecord) return;

    try {
      const values = await cardForm.validateFields();
      setSubmitting(true);
      await upsertAlumniCard(editingRecord.id, {
        slogan: values.slogan?.trim() || undefined,
        wechat: values.wechat?.trim() || undefined,
        showPhone: values.showPhone ? 1 : 0,
        showWechat: values.showWechat ? 1 : 0,
        needApproval: values.needApproval ? 1 : 0,
        allowSearch: values.allowSearch ? 1 : 0,
      });
      message.success('名片信息已保存');
      setCardOpen(false);
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<AlumniListItem>[] = [
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 150, search: false, render: (_, record) => record.phone || '-' },
    { title: '院系 / 专业', dataIndex: 'major', search: false, render: (_, record) => `${record.college || '-'} / ${record.major || '-'}` },
    { title: '班级', dataIndex: 'class_name', search: false, width: 120, render: (_, record) => record.class_name || '-' },
    { title: '入学年份', dataIndex: 'enrollmentYear', width: 110, valueType: 'digit', render: (_, record) => record.enrollment_year ?? '-' },
    { title: '城市', dataIndex: 'city', width: 100, render: (_, record) => record.city || '-' },
    { title: '工作单位', dataIndex: 'company', search: false, ellipsis: true, render: (_, record) => record.company || '-' },
    {
      title: '认证状态',
      dataIndex: 'verifiedStatus',
      width: 110,
      valueType: 'select',
      valueEnum: { 0: { text: '未认证' }, 1: { text: '认证中' }, 2: { text: '已认证' }, 3: { text: '认证失败' } },
      render: (_, record) => {
        const meta = getVerifiedMeta(record.verified_status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: { 1: { text: '正常' }, 0: { text: '禁用' } },
      render: (_, record) => {
        const meta = getStatusMeta(record.status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    { title: '创建时间', dataIndex: 'created_at', width: 180, search: false, render: (_, record) => formatDateTime(record.created_at) },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, record) => [
        <a key="edit" onClick={() => void loadDetailAndOpen(record, 'edit')}>编辑</a>,
        <a key="student" onClick={() => void loadDetailAndOpen(record, 'student')}>学籍</a>,
        <a key="card" onClick={() => void loadDetailAndOpen(record, 'card')}>名片</a>,
        <Switch
          key="status"
          size="small"
          checked={record.status === 1}
          onChange={(checked) => {
            void updateAlumniStatus(record.id, checked ? 1 : 0)
              .then(() => {
                message.success(`已${checked ? '启用' : '禁用'}校友`);
                void actionRef.current?.reload();
              })
              .catch((error: unknown) => {
                message.error(error instanceof Error ? error.message : '更新状态失败');
              });
          }}
        />,
      ],
    },
  ];

  return (
    <div className="business-page">
      <Row gutter={[16, 16]} className="business-page__summary">
        <Col xs={24} sm={12} xl={6}><Card variant="borderless"><Statistic title="当前结果总数" value={summary.total} prefix={<BankOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card variant="borderless"><Statistic title="已认证校友" value={summary.verified} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card variant="borderless"><Statistic title="待认证校友" value={summary.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card variant="borderless"><Statistic title="覆盖城市" value={summary.cities} /></Card></Col>
      </Row>

      <ProTable<AlumniListItem>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        headerTitle="校友管理"
        columns={columns}
        request={async (params) => {
          const data = await fetchAlumni({
            current: params.current,
            pageSize: params.pageSize,
            keyword: typeof params.name === 'string' ? params.name : undefined,
            verifiedStatus: params.verifiedStatus as number | string | undefined,
            status: params.status as number | string | undefined,
            enrollmentYear: params.enrollmentYear as number | string | undefined,
            company: typeof params.company === 'string' ? params.company : undefined,
          });

          setSummary({
            total: data.total,
            verified: data.list.filter((item) => item.verified_status === 2).length,
            pending: data.list.filter((item) => item.verified_status !== 2).length,
            cities: new Set(data.list.map((item) => item.city).filter(Boolean)).size,
          });

          return { data: data.list, total: data.total, success: true };
        }}
        search={{ labelWidth: 92, defaultCollapsed: false }}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        toolbar={{ subTitle: '已接入真实后端接口，可直接维护校友基础信息、学籍和名片。' }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              form.setFieldsValue({ status: 1, verifiedStatus: 0, allowSearch: true });
              setEditOpen(true);
            }}
          >
            新增校友
          </Button>,
        ]}
      />

      <Modal title={editingRecord ? '编辑校友' : '新增校友'} open={editOpen} confirmLoading={submitting} destroyOnHidden okText="确定" cancelText="取消" onOk={() => void handleSubmitAlumni()} onCancel={() => { setEditOpen(false); setEditingRecord(null); form.resetFields(); }}>
        <Form form={form} layout="vertical" initialValues={{ status: 1, verifiedStatus: 0, allowSearch: true }}>
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}><Input /></Form.Item>
          <Form.Item label="手机号" name="phone"><Input /></Form.Item>
          <Form.Item label="OpenID" name="openId"><Input /></Form.Item>
          <Form.Item label="公司" name="company"><Input /></Form.Item>
          <Form.Item label="职位" name="position"><Input /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="简介" name="bio"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="账号状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select options={[{ label: '正常', value: 1 }, { label: '禁用', value: 0 }]} /></Form.Item>
          <Form.Item label="认证状态" name="verifiedStatus" rules={[{ required: true, message: '请选择认证状态' }]}><Select options={[{ label: '未认证', value: 0 }, { label: '认证中', value: 1 }, { label: '已认证', value: 2 }, { label: '认证失败', value: 3 }]} /></Form.Item>
          <Form.Item label="允许搜索" name="allowSearch" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<Space><IdcardOutlined />学籍信息</Space>} open={studentOpen} confirmLoading={submitting} destroyOnHidden okText="确定" cancelText="取消" onOk={() => void handleSubmitStudent()} onCancel={() => setStudentOpen(false)}>
        <Form form={studentForm} layout="vertical" initialValues={{ school: '融川大学', status: 0 }}>
          <Form.Item label="学校" name="school" rules={[{ required: true, message: '请输入学校' }]}><Input /></Form.Item>
          <Form.Item label="学院" name="college"><Input /></Form.Item>
          <Form.Item label="专业" name="major" rules={[{ required: true, message: '请输入专业' }]}><Input /></Form.Item>
          <Form.Item label="班级" name="className"><Input /></Form.Item>
          <Form.Item label="学号" name="studentNo"><Input /></Form.Item>
          <Form.Item label="入学年份" name="enrollmentYear" rules={[{ required: true, message: '请输入入学年份' }]}><InputNumber min={1900} max={2099} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="毕业年份" name="graduationYear"><InputNumber min={1900} max={2099} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="学籍状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select options={[{ label: '待认领', value: 0 }, { label: '已认领', value: 1 }, { label: '已审核', value: 2 }]} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<Space><ProfileOutlined />名片信息</Space>} open={cardOpen} confirmLoading={submitting} destroyOnHidden okText="确定" cancelText="取消" onOk={() => void handleSubmitCard()} onCancel={() => setCardOpen(false)}>
        <Form form={cardForm} layout="vertical" initialValues={{ showPhone: false, showWechat: false, needApproval: false, allowSearch: true }}>
          <Form.Item label="名片标语" name="slogan"><Input /></Form.Item>
          <Form.Item label="微信号" name="wechat"><Input /></Form.Item>
          <Form.Item label="展示手机号" name="showPhone" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item label="展示微信号" name="showWechat" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item label="交换需审核" name="needApproval" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item label="允许搜索" name="allowSearch" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
