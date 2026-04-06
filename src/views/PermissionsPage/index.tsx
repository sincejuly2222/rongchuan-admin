import { App, Form } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import {
  createPermission,
  updatePermission,
} from '../../api/permissions';
import { PermissionModals } from './components/PermissionModals';
import { PermissionsTable } from './components/PermissionsTable';
import type {
  PermissionFormValues,
  PermissionRecord,
  PermissionTabKey,
} from './types';
import './index.less';

export function PermissionsPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<PermissionFormValues>();
  const [activeTab, setActiveTab] = useState<PermissionTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<PermissionRecord[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PermissionRecord | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (currentRecord) {
        await updatePermission(currentRecord.id, {
          permissionCode: values.permissionCode.trim(),
          permissionName: values.permissionName.trim(),
          description: values.description?.trim() || null,
        });
        message.success(`已更新权限 ${values.permissionName}`);
      } else {
        await createPermission({
          permissionCode: values.permissionCode.trim(),
          permissionName: values.permissionName.trim(),
          description: values.description?.trim() || null,
        });
        message.success(`已新增权限 ${values.permissionName}`);
      }

      setModalOpen(false);
      setCurrentRecord(null);
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

  return (
    <div className="page-root">
      <PermissionsTable
        actionRef={actionRef}
        activeTab={activeTab}
        selectedRows={selectedRows}
        setActiveTab={setActiveTab}
        setSelectedRows={setSelectedRows}
        onCreate={() => {
          setCurrentRecord(null);
          form.resetFields();
          setModalOpen(true);
        }}
        onView={(record) => {
          setCurrentRecord(record);
          setDetailOpen(true);
        }}
        onEdit={(record) => {
          setCurrentRecord(record);
          form.setFieldsValue({
            permissionCode: record.code,
            permissionName: record.name,
            description: record.description === '-' ? '' : record.description,
          });
          setModalOpen(true);
        }}
      />

      <PermissionModals
        form={form}
        currentRecord={currentRecord}
        detailOpen={detailOpen}
        modalOpen={modalOpen}
        submitting={submitting}
        onSubmit={() => void handleSubmit()}
        onDetailCancel={() => {
          setDetailOpen(false);
          setCurrentRecord(null);
        }}
        onModalCancel={() => {
          setModalOpen(false);
          setCurrentRecord(null);
          form.resetFields();
        }}
      />
    </div>
  );
}
