import { CloudUploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Alert, App, Button, Card, Col, Progress, Radio, Row, Space, Statistic, Steps, Tag, Typography, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { useRef, useState } from 'react';
import { fetchImportJobs, uploadImportFile } from '../../api/importJobs';
import type { ImportJobItem } from '../../api/types';
import '../BusinessPageCommon.less';

const templateFields = ['姓名', '手机号', '入学年份', '学院', '专业', '班级', '学号'];

function getImportStatusMeta(status: number) {
  if (status === 1) return { text: '校验中', color: 'processing' as const };
  if (status === 2) return { text: '已完成', color: 'success' as const };
  return { text: '待确认', color: 'warning' as const };
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

export function ExcelImportPage() {
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'alumni' | 'student'>('alumni');
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });

  const uploadProps: UploadProps = {
    multiple: false,
    showUploadList: true,
    beforeUpload(file) {
      setSelectedFile(file);
      return Upload.LIST_IGNORE;
    },
    onRemove() {
      setSelectedFile(null);
    },
  };

  const columns: ProColumns<ImportJobItem>[] = [
    { title: '任务名称', dataIndex: 'name', ellipsis: true },
    {
      title: '导入类型',
      dataIndex: 'type',
      width: 110,
      valueType: 'select',
      valueEnum: { alumni: { text: '校友资料' }, student: { text: '学籍资料' } },
      render: (_, record) => (record.type === 'student' ? '学籍资料' : '校友资料'),
    },
    { title: '执行人', dataIndex: 'operator_name', width: 120, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      valueType: 'select',
      valueEnum: { 0: { text: '待确认' }, 1: { text: '校验中' }, 2: { text: '已完成' } },
      render: (_, record) => {
        const meta = getImportStatusMeta(record.status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    { title: '成功 / 失败', search: false, render: (_, record) => `${record.success_count} / ${record.failed_count}` },
    { title: '创建时间', dataIndex: 'created_at', search: false, width: 180, render: (_, record) => formatDateTime(record.created_at) },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      render: (_, record) => [
        <a
          key="report"
          onClick={() => {
            modal.info({
              title: '导入报告',
              width: 720,
              content: (
                <div>
                  <p>文件：{record.name}</p>
                  <p>成功：{record.success_count}，失败：{record.failed_count}</p>
                  <pre style={{ maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {record.error_details?.length
                      ? record.error_details.map((item) => `第 ${item.row} 行：${item.message}`).join('\n')
                      : '没有错误记录'}
                  </pre>
                </div>
              ),
            });
          }}
        >
          查看报告
        </a>,
      ],
    },
  ];

  return (
    <div className="business-page">
      <Row gutter={[16, 16]} className="business-page__summary">
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="导入任务数" value={summary.total} prefix={<CloudUploadOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="累计成功导入" value={summary.success} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} xl={8}><Card variant="borderless"><Statistic title="累计失败记录" value={summary.failed} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Excel 批量导入" variant="borderless" className="business-page__upload-card">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Alert type="info" showIcon message="已接入真实导入接口" description="支持上传 Excel 后直接入库，并自动生成导入任务记录与错误报告。" />
              <Steps items={[{ title: '上传 Excel', description: '选择校友或学籍模板' }, { title: '后端解析', description: '读取首个工作表并执行校验' }, { title: '数据入库', description: '成功记录写入业务表' }, { title: '生成报告', description: '导入结果写入任务记录' }]} />
              <Radio.Group value={importType} onChange={(event) => setImportType(event.target.value)} options={[{ label: '校友资料', value: 'alumni' }, { label: '学籍资料', value: 'student' }]} optionType="button" />
              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon"><FileExcelOutlined /></p>
                <p className="ant-upload-text">拖拽 Excel 到这里，或点击选择文件</p>
                <p className="ant-upload-hint">支持 `.xlsx` / `.xls`，系统会解析首个工作表</p>
              </Upload.Dragger>
              <div className="business-page__progress">
                <div className="business-page__metric">
                  <Typography.Text type="secondary">文件选择进度</Typography.Text>
                  <Progress percent={selectedFile ? 100 : 0} status={selectedFile ? 'success' : 'normal'} />
                </div>
                <div className="business-page__metric">
                  <Typography.Text type="secondary">模板字段</Typography.Text>
                  <div>{templateFields.join(' / ')}</div>
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  loading={uploading}
                  disabled={!selectedFile}
                  onClick={() => {
                    if (!selectedFile) {
                      message.warning('请先选择 Excel 文件');
                      return;
                    }

                    setUploading(true);
                    void uploadImportFile(selectedFile, importType)
                      .then((job) => {
                        message.success(`导入完成：成功 ${job.success_count} 条，失败 ${job.failed_count} 条`);
                        setSelectedFile(null);
                        void actionRef.current?.reload();
                      })
                      .catch((error: unknown) => {
                        message.error(error instanceof Error ? error.message : '导入失败');
                      })
                      .finally(() => {
                        setUploading(false);
                      });
                  }}
                >
                  开始导入
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const content = `${templateFields.join(',')}\n张三,13800000001,2018,信息学院,计算机科学与技术,1801,20180001`;
                    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = importType === 'student' ? '学籍导入模板.csv' : '校友导入模板.csv';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  下载模板
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="导入建议" variant="borderless" className="business-page__upload-card">
            <Space direction="vertical" size={12}>
              <Typography.Text>1. 第一行必须是表头，系统会按中文表头匹配字段。</Typography.Text>
              <Typography.Text>2. 校友导入建议至少包含“姓名”，学籍导入建议至少包含“姓名、专业、入学年份”。</Typography.Text>
              <Typography.Text>3. 学籍导入会优先按手机号或 OpenID 关联校友，不存在时自动创建基础校友。</Typography.Text>
              <Typography.Text>4. 导入完成后可在下方任务记录里查看失败原因。</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <ProTable<ImportJobItem>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        headerTitle="导入任务记录"
        columns={columns}
        request={async (params) => {
          const data = await fetchImportJobs({
            current: params.current,
            pageSize: params.pageSize,
            type: params.type as string | undefined,
            status: params.status as number | string | undefined,
          });

          setSummary({
            total: data.total,
            success: data.list.reduce((sum, item) => sum + item.success_count, 0),
            failed: data.list.reduce((sum, item) => sum + item.failed_count, 0),
          });

          return { data: data.list, total: data.total, success: true };
        }}
        search={{ labelWidth: 92, defaultCollapsed: false }}
        pagination={{ pageSize: 6, showSizeChanger: true }}
        options={{ density: true, fullScreen: true, reload: true, setting: true }}
      />
    </div>
  );
}
