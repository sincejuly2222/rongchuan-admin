import { AuditOutlined, CheckCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Card, Col, Row, Select, Space, Statistic, Tag } from 'antd';
import { useRef, useState } from 'react';
import { fetchStudentRecords, updateStudentRecordStatus } from '../../api/studentRecords';
import type { StudentRecordListItem } from '../../api/types';
import '../BusinessPageCommon.less';

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

function getStatusMeta(status: number) {
  if (status === 1) return { text: '已认领', color: 'processing' as const };
  if (status === 2) return { text: '已审核', color: 'success' as const };
  return { text: '待认领', color: 'default' as const };
}

export function StudentStatusPage() {
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [summary, setSummary] = useState({ total: 0, approved: 0, claimed: 0 });

  const columns: ProColumns<StudentRecordListItem>[] = [
    { title: '姓名', dataIndex: 'name', width: 110 },
    { title: '学号', dataIndex: 'student_no', width: 140, copyable: true, render: (_, record) => record.student_no || '-' },
    { title: '院系', dataIndex: 'college', ellipsis: true, render: (_, record) => record.college || '-' },
    { title: '专业', dataIndex: 'major', ellipsis: true },
    { title: '班级', dataIndex: 'class_name', width: 120, search: false, render: (_, record) => record.class_name || '-' },
    { title: '入学年份', dataIndex: 'enrollmentYear', width: 110, valueType: 'digit', render: (_, record) => record.enrollment_year },
    {
      title: '审核状态',
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: { 0: { text: '待认领' }, 1: { text: '已认领' }, 2: { text: '已审核' } },
      render: (_, record) => {
        const meta = getStatusMeta(record.status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    { title: '手机号', dataIndex: 'phone', width: 150, search: false, render: (_, record) => record.phone || '-' },
    { title: '更新时间', dataIndex: 'updated_at', width: 180, search: false, render: (_, record) => formatDateTime(record.updated_at) },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a
          key="audit"
          onClick={() => {
            let nextStatus = record.status;
            modal.confirm({
              title: '更新学籍状态',
              content: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <span>请选择新的学籍状态</span>
                  <Select
                    defaultValue={record.status}
                    options={[
                      { label: '待认领', value: 0 },
                      { label: '已认领', value: 1 },
                      { label: '已审核', value: 2 },
                    ]}
                    onChange={(value) => {
                      nextStatus = value;
                    }}
                    style={{ width: '100%' }}
                  />
                </Space>
              ),
              onOk: async () => {
                await updateStudentRecordStatus(record.id, nextStatus);
                message.success('学籍状态已更新');
                void actionRef.current?.reload();
              },
            });
          }}
        >
          审核
        </a>,
      ],
    },
  ];

  return (
    <div className="business-page">
      <Row gutter={[16, 16]} className="business-page__summary">
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="当前学籍记录" value={summary.total} prefix={<FolderOpenOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="已审核" value={summary.approved} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="已认领" value={summary.claimed} prefix={<AuditOutlined />} /></Card></Col>
      </Row>

      <ProTable<StudentRecordListItem>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        headerTitle="学籍管理"
        columns={columns}
        request={async (params) => {
          const data = await fetchStudentRecords({
            current: params.current,
            pageSize: params.pageSize,
            keyword: typeof params.name === 'string' ? params.name : undefined,
            status: params.status as number | string | undefined,
            enrollmentYear: params.enrollmentYear as number | string | undefined,
            major: typeof params.major === 'string' ? params.major : undefined,
          });

          setSummary({
            total: data.total,
            approved: data.list.filter((item) => item.status === 2).length,
            claimed: data.list.filter((item) => item.status >= 1).length,
          });

          return { data: data.list, total: data.total, success: true };
        }}
        search={{ labelWidth: 92, defaultCollapsed: false }}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
        toolbar={{ subTitle: '已接入真实学籍接口，可按姓名、专业、入学年份和状态筛选。' }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
      />
    </div>
  );
}
