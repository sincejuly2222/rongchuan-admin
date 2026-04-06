import { Descriptions, Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd';
import type { PermissionFormValues, PermissionRecord } from '../../types';

type PermissionModalsProps = {
  form: FormInstance<PermissionFormValues>;
  currentRecord: PermissionRecord | null;
  detailOpen: boolean;
  modalOpen: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onDetailCancel: () => void;
  onModalCancel: () => void;
};

export function PermissionModals({
  form,
  currentRecord,
  detailOpen,
  modalOpen,
  submitting,
  onSubmit,
  onDetailCancel,
  onModalCancel,
}: PermissionModalsProps) {
  return (
    <>
      <Modal title="权限详情" open={detailOpen} footer={null} onCancel={onDetailCancel}>
        {currentRecord ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="权限名称">{currentRecord.name}</Descriptions.Item>
            <Descriptions.Item label="权限编码">{currentRecord.code}</Descriptions.Item>
            <Descriptions.Item label="权限说明">
              {currentRecord.description === '-' ? '未填写' : currentRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="绑定角色数">{currentRecord.roleCount}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{currentRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={currentRecord ? '编辑权限' : '新增权限'}
        open={modalOpen}
        forceRender
        confirmLoading={submitting}
        destroyOnHidden
        onOk={onSubmit}
        onCancel={onModalCancel}
      >
        <Form<PermissionFormValues> form={form} layout="vertical">
          <Form.Item
            label="权限名称"
            name="permissionName"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            label="权限编码"
            name="permissionCode"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input placeholder="请输入权限编码，例如 user:list" />
          </Form.Item>

          <Form.Item label="权限说明" name="description">
            <Input.TextArea placeholder="请输入权限说明" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
